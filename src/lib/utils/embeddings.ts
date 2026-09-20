/**
 * Provider-independent embedding generation for semantic search.
 *
 * Phase 3: the knowledge base needs semantic similarity between use cases
 * and between a free-text query and use cases. This module abstracts the
 * embedding producer behind `EmbeddingProvider` so a concrete provider
 * (OpenAI, Cohere, a local model, …) can be swapped in without touching the
 * service layer.
 *
 * The default provider is a deterministic local "hashing" embedding
 * (bag-of-words via the hashing trick, L2-normalized). It needs no network
 * and no API key, so semantic search works offline and in CI. When a real
 * provider is wired (env `AI_PROVIDER` + `AI_API_KEY`), `getEmbeddingProvider`
 * can return it instead; everything downstream is unchanged.
 *
 * NOTE on pgvector: the schema currently has no persisted vector column (the
 * Phase 3 constraint forbids editing prisma/schema.prisma). Semantic search is
 * therefore computed in-memory over on-the-fly embeddings. When a `embedding`
 * column is added later, the repository can persist embeddings and use
 * pgvector's `<=>` / `<->` operators for DB-side similarity; the provider
 * abstraction here stays the same.
 */

export interface EmbeddingProvider {
  /** Stable identifier (e.g. 'local-hashing', 'openai'). */
  readonly name: string
  /** Length of every vector this provider emits. */
  readonly dimensions: number
  /** Embed a batch of texts; order is preserved. */
  embed(texts: string[]): Promise<number[][]>
}

/** Cosine similarity for two equal-length vectors. Returns -1..1. */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0
  let dot = 0
  let na = 0
  let nb = 0
  for (let i = 0; i < a.length; i++) {
    const av = a[i]
    const bv = b[i]
    dot += av * bv
    na += av * av
    nb += bv * bv
  }
  if (na === 0 || nb === 0) return 0
  return dot / (Math.sqrt(na) * Math.sqrt(nb))
}

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'of', 'to', 'in', 'on', 'for', 'with',
  'by', 'at', 'from', 'as', 'is', 'are', 'be', 'this', 'that', 'it', 'its',
  'into', 'across', 'using', 'use', 'case', 'cases', 'agent', 'agents',
])

/** Lowercase alphanumeric tokenizer used by the local provider. */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t))
}

/** Deterministic 32-bit hash of a string (FNV-1a). */
function fnv1a(str: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h | 0
}

function l2normalize(vec: number[]): number[] {
  let norm = 0
  for (const v of vec) norm += v * v
  norm = Math.sqrt(norm)
  if (norm === 0) return vec
  return vec.map((v) => v / norm)
}

/**
 * Deterministic local embedding via the hashing trick.
 *
 * Each token hashes to a bucket index and a sign (+1/-1); token counts
 * accumulate signed magnitudes, then the vector is L2-normalized so cosine
 * similarity is a simple dot product. This yields a reasonable lexical
 * similarity signal with zero dependencies and zero network.
 */
class HashingEmbeddingProvider implements EmbeddingProvider {
  readonly name = 'local-hashing'
  readonly dimensions = 384

  async embed(texts: string[]): Promise<number[][]> {
    return texts.map((t) => this.embedOne(t))
  }

  private embedOne(text: string): number[] {
    const vec = new Array<number>(this.dimensions).fill(0)
    for (const token of tokenize(text)) {
      const h = fnv1a(token)
      const idx = Math.abs(h) % this.dimensions
      const sign = (h & 1) === 0 ? 1 : -1
      vec[idx] += sign
    }
    return l2normalize(vec)
  }
}

/**
 * Factory returning the active `EmbeddingProvider`.
 *
 * Selection is intentionally simple: when a provider name + API key are present
 * in the environment, a concrete remote provider may be returned. Otherwise
 * the local deterministic provider is used so semantic search always works.
 *
 * Phase 3 ships the local provider only; remote providers are wired in a
 * later phase by adding cases below.
 */
export function getEmbeddingProvider(): EmbeddingProvider {
  const provider = process.env.AI_PROVIDER ?? ''
  const apiKey = process.env.AI_API_KEY ?? ''
  if (provider && apiKey) {
    // TODO(later phase): return a concrete remote provider for `provider`.
    // Falling through to the local provider keeps everything working offline.
  }
  return new HashingEmbeddingProvider()
}

/** Embed a single query string. */
export async function embedQuery(text: string): Promise<number[]> {
  const [vec] = await getEmbeddingProvider().embed([text])
  return vec
}

/** Embed multiple texts in one call. */
export async function embedBatch(texts: string[]): Promise<number[][]> {
  return getEmbeddingProvider().embed(texts)
}

/**
 * Rank a list of items by cosine similarity of their precomputed embeddings
 * to a query embedding. Returns indices+scores sorted by score descending.
 */
export function rankBySimilarity<T>(
  queryEmbedding: number[],
  candidates: T[],
  embeddingOf: (item: T) => number[],
): Array<{ item: T; score: number }> {
  return candidates
    .map((item) => ({ item, score: cosineSimilarity(queryEmbedding, embeddingOf(item)) }))
    .sort((a, b) => b.score - a.score)
}
