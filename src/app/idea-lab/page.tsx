import type { Metadata } from 'next'
import { PageHeader } from '@/components/PageHeader'
import { IdeaForm } from '@/components/idea/IdeaForm'

export const metadata: Metadata = {
  title: 'Idea Lab',
  description:
    'Submit a process, problem or opportunity and the Idea Lab helps shape it into a quantified business case.',
  alternates: { canonical: '/idea-lab' },
}

type SearchParams = { searchParams: Promise<{ idea?: string }> }

export default async function IdeaLabPage({ searchParams }: SearchParams) {
  const { idea } = await searchParams
  const initialIdea = idea ? decodeURIComponent(idea) : undefined

  return (
    <>
      <PageHeader
        kicker="Tools"
        title="Idea Lab"
        description="Bring a rough idea and leave with a structured business case: the problem, the agent pattern, the value drivers and the controls."
      />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <IdeaForm initialIdea={initialIdea} />
      </div>
    </>
  )
}
