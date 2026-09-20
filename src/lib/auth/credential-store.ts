/**
 * Pluggable credential store for the credentials auth provider.
 *
 * The Prisma `User` model has no password column (the schema cannot be
 * modified in this phase), so password hashes are persisted by a
 * `CredentialStore` implementation. The default `FileCredentialStore` writes a
 * JSON file under `.data/` in the app working directory — a "for now"
 * implementation that keeps registration/login functional without schema
 * changes. Swap in a DB-backed store (once a password column exists) by
 * providing a different implementation via `setCredentialStore`.
 */

import { mkdir, readFile, writeFile, rename } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { randomUUID } from 'node:crypto'

export interface StoredCredential {
  /** The User.id this credential belongs to. */
  userId: string
  /** Portable scrypt hash string (see password.ts). */
  passwordHash: string
}

export interface CredentialStore {
  get(email: string): Promise<StoredCredential | null>
  set(email: string, credential: StoredCredential): Promise<void>
  has(email: string): Promise<boolean>
}

type StoreData = Record<string, StoredCredential>

const DEFAULT_STORE_PATH = join(process.cwd(), '.data', 'auth-credentials.json')

class FileCredentialStore implements CredentialStore {
  constructor(private readonly path: string = DEFAULT_STORE_PATH) {}

  private async read(): Promise<StoreData> {
    try {
      const raw = await readFile(this.path, 'utf8')
      const parsed: unknown = JSON.parse(raw)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as StoreData
      }
      return {}
    } catch {
      return {}
    }
  }

  private async write(data: StoreData): Promise<void> {
    await mkdir(dirname(this.path), { recursive: true })
    // Atomic-ish write: tmp file then rename, so a crash mid-write cannot
    // corrupt the store.
    const tmp = `${this.path}.${randomUUID()}.tmp`
    await writeFile(tmp, JSON.stringify(data, null, 2), 'utf8')
    await rename(tmp, this.path)
  }

  private normalize(email: string): string {
    return email.trim().toLowerCase()
  }

  async get(email: string): Promise<StoredCredential | null> {
    const data = await this.read()
    return data[this.normalize(email)] ?? null
  }

  async set(email: string, credential: StoredCredential): Promise<void> {
    const data = await this.read()
    data[this.normalize(email)] = credential
    await this.write(data)
  }

  async has(email: string): Promise<boolean> {
    const data = await this.read()
    return this.normalize(email) in data
  }
}

let activeStore: CredentialStore = new FileCredentialStore()

/** Replace the active credential store (e.g. with a DB-backed one). */
export function setCredentialStore(store: CredentialStore): void {
  activeStore = store
}

export function getCredentialStore(): CredentialStore {
  return activeStore
}
