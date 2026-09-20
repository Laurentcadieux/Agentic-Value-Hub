/**
 * Use-case business logic: keyword + semantic search, normalization, related
 * discovery and create/update orchestration. Wraps the repository and the
 * provider-independent embedding layer.
 */
import {
  useCaseRepository,
  slugify,
  type UseCaseFilters,
  type UseCaseListOptions,
  type UseCaseWithNews,
  type UseCaseWriteInput,
  type UseCaseFacets,
} from '@/lib/repositories/usecase-repository'
import { UseCase, UseCaseStatus, News } from '@prisma/client'
import { embedBatch, embedQuery, cosineSimilarity } from '@/lib/utils/embeddings'

/** API output shape: Prisma UseCase with a display-normalized potential. */
export type UseCaseDTO = Omit<UseCase, 'automationPotential'> & {
  automationPotential: number | null
}

/** Related-search result returned to clients and pages. */
export interface RelatedResult {
  useCases: UseCaseDTO[]
  news: News[]
}

export interface UseCaseSearchOptions extends UseCaseListOptions {
  /** When true and `q` is present, rank results by embedding similarity. */
  semantic?: boolean
}

export interface UseCaseSearchResult {
  items: UseCaseDTO[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  semantic: boolean
  /** Per-item similarity scores, present only for semantic results. */
  scores?: number[]
}

const MAX_SEMANTIC_CANDIDATES = 200

/**
 * Normalize `automationPotential` for display as a 0..100 integer.
 *
 * The schema stores a free-form Float; the seed uses 0..1 while the public demo
 * data uses 0..100. This normalizes both to a 0..100 integer so the UI is
 * consistent regardless of which convention a row uses. Values already > 1 are
 * treated as 0..100; values <= 1 are scaled up.
 */
export function normalizePotential(value: number | null | undefined): number | null {
  if (value === null || value === undefined || Number.isNaN(value)) return null
  const pct = value <= 1 ? value * 100 : value
  return Math.round(Math.max(0, Math.min(100, pct)))
}

function toDTO(uc: UseCase): UseCaseDTO {
  const { automationPotential, ...rest } = uc
  return { ...rest, automationPotential: normalizePotential(automationPotential) }
}

/**
 * Public-facing DTO: keeps the generic / presentation fields a public viewer may
 * see, and strips customer-specific or sensitive operational fields
 * (`risks`, `controls`, `systems`, `sourceRefs`, `customerId`).
 *
 * Accepts either a raw `UseCase` or an already-normalized `UseCaseDTO` /
 * `UseCaseWithNews` (the linked `newsUseCases` relation is dropped too, since
 * it is not part of the generic public view).
 */
export type PublicUseCaseDTO = Omit<
  UseCaseDTO,
  'risks' | 'controls' | 'systems' | 'sourceRefs' | 'customerId' | 'newsUseCases'
>

export function toPublicDTO<T extends { automationPotential: number | null }>(
  useCase: T,
): PublicUseCaseDTO {
  // `risks`, `controls`, `systems`, `sourceRefs`, `customerId` and any
  // `newsUseCases` relation are stripped; everything else is public.
  const {
    risks: _risks,
    controls: _controls,
    systems: _systems,
    sourceRefs: _sourceRefs,
    customerId: _customerId,
    newsUseCases: _newsUseCases,
    ...rest
  } = useCase as unknown as UseCase & { newsUseCases?: unknown }
  return rest as PublicUseCaseDTO
}

/** Build the text blob used to embed a use case for semantic similarity. */
export function buildUseCaseText(uc: Pick<
  UseCase,
  | 'title' | 'description' | 'problem' | 'agentPattern' | 'automationPattern'
  | 'industry' | 'businessFunction' | 'technologies' | 'valueDrivers' | 'systems'
>): string {
  return [
    uc.title,
    uc.description ?? '',
    uc.problem ?? '',
    uc.agentPattern ?? '',
    uc.automationPattern ?? '',
    uc.industry ?? '',
    uc.businessFunction ?? '',
    (uc.technologies ?? []).join(' '),
    (uc.valueDrivers ?? []).join(' '),
    (uc.systems ?? []).join(' '),
  ].join(' ')
}

function paginateOf(options: UseCaseListOptions): { page: number; pageSize: number } {
  const page = Math.max(1, Math.floor(options.page ?? 1))
  const pageSize = Math.min(100, Math.max(1, Math.floor(options.pageSize ?? 12)))
  return { page, pageSize }
}

export const useCaseService = {
  /** Keyword search (default) or semantic ranking when `semantic` is set. */
  async search(options: UseCaseSearchOptions = {}): Promise<UseCaseSearchResult> {
    const { semantic = false, ...listOpts } = options
    const q = listOpts.q?.trim()

    if (semantic && q) {
      // Candidate set: apply every filter except the `q` keyword, up to a cap.
      const base = await useCaseRepository.findMany({
        ...listOpts,
        q: undefined,
        page: 1,
        pageSize: MAX_SEMANTIC_CANDIDATES,
      })

      const queryEmbedding = await embedQuery(q)
      const embeddings = await embedBatch(base.items.map(buildUseCaseText))

      const ranked = base.items
        .map((item, i) => ({ item, score: cosineSimilarity(queryEmbedding, embeddings[i]) }))
        .sort((a, b) => b.score - a.score)

      const { page, pageSize } = paginateOf(options)
      const total = ranked.length
      const slice = ranked.slice((page - 1) * pageSize, page * pageSize)

      return {
        items: slice.map((r) => toDTO(r.item)),
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
        semantic: true,
        scores: slice.map((r) => Number(r.score.toFixed(4))),
      }
    }

    const res = await useCaseRepository.findMany(listOpts)
    return {
      items: res.items.map(toDTO),
      total: res.total,
      page: res.page,
      pageSize: res.pageSize,
      totalPages: res.totalPages,
      semantic: false,
    }
  },

  async getById(id: string): Promise<UseCaseWithNews | null> {
    return useCaseRepository.findById(id)
  },

  async getBySlug(slug: string): Promise<UseCaseWithNews | null> {
    return useCaseRepository.findBySlug(slug)
  },

  /**
   * Related use cases (semantic + structural) and related news for a use case.
   * Structural candidates are re-ranked by embedding similarity so the closest
   * in meaning surface first; falls back to pure structural ranking if
   * embeddings are unavailable.
   */
  async getRelated(slug: string, limit = 5): Promise<RelatedResult> {
    const source = await useCaseRepository.findBySlug(slug)
    if (!source) return { useCases: [], news: [] }

    const candidates = await useCaseRepository.findRelated(source.id, limit * 3)
    let ranked: UseCase[]

    if (candidates.length > 1) {
      try {
        const sourceEmb = await embedQuery(buildUseCaseText(source))
        const embs = await embedBatch(candidates.map(buildUseCaseText))
        ranked = candidates
          .map((c, i) => ({ c, score: cosineSimilarity(sourceEmb, embs[i]) }))
          .sort((a, b) => b.score - a.score)
          .map((r) => r.c)
      } catch {
        ranked = candidates
      }
    } else {
      ranked = candidates
    }

    const news = await useCaseRepository.findRelatedNews(source.id, limit)
    return { useCases: ranked.slice(0, limit).map(toDTO), news }
  },

  async getFacets(status: UseCaseStatus | 'ALL' = UseCaseStatus.PUBLISHED): Promise<UseCaseFacets> {
    return useCaseRepository.getFacets(status)
  },

  async create(data: UseCaseWriteInput): Promise<UseCase> {
    const slug = data.slug?.trim() || slugify(data.title)
    if (!slug) throw new Error('A slug could not be derived and none was provided')
    if (await useCaseRepository.slugExists(slug)) {
      throw new Error(`A use case with slug "${slug}" already exists`)
    }
    return useCaseRepository.create({ ...data, slug })
  },

  async update(id: string, data: Partial<UseCaseWriteInput>): Promise<UseCase> {
    if (data.slug && data.slug !== (await useCaseRepository.findById(id))?.slug) {
      if (await useCaseRepository.slugExists(data.slug, id)) {
        throw new Error(`A use case with slug "${data.slug}" already exists`)
      }
    }
    return useCaseRepository.update(id, data)
  },

  async delete(id: string): Promise<UseCase> {
    return useCaseRepository.delete(id)
  },
}
