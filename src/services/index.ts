// Service exports.
export { useCaseService, normalizePotential, buildUseCaseText } from '@/services/usecase-service'
export type {
  UseCaseDTO,
  UseCaseSearchOptions,
  UseCaseSearchResult,
  RelatedResult,
} from '@/services/usecase-service'

// Idea Lab (Phase 5).
export {
  createIdea,
  getIdea,
  updateIdea,
  assessIdea,
  listIdeasByCustomer,
  extractOpportunityCard,
  extractFromConversation,
  calculateIdeaValue,
  buildValueInputs,
  DEFAULT_VALUE_INPUTS,
} from '@/services/idea-service'
export type { IdeationInput, IdeaServiceResult } from '@/services/idea-service'
