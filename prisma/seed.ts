/**
 * DEMO seed data for Agentic Value Hub.
 * Run with: npm run db:seed
 *
 * This script creates a demo customer, user, 2 use cases, and 2 news items.
 * Intended for local/dev environments only.
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding DEMO data...')

  // DEMO customer
  const customer = await prisma.customer.create({
    data: {
      companyName: 'Acme Manufacturing',
      website: 'https://acme.example.com',
      industry: 'Manufacturing',
      employeeRange: '1000-5000',
      country: 'United States',
    },
  })

  // DEMO user
  const user = await prisma.user.create({
    data: {
      customerId: customer.id,
      email: 'demo@acme.example.com',
      firstName: 'Demo',
      lastName: 'User',
      role: 'ADMIN',
    },
  })

  // DEMO use cases (x2)
  const useCase1 = await prisma.useCase.create({
    data: {
      slug: 'invoice-reconciliation-automation',
      title: 'Invoice Reconciliation Automation',
      industry: 'Manufacturing',
      businessFunction: 'Finance',
      problem: 'Manual invoice matching against POs is slow and error-prone.',
      description:
        'AI agent ingests invoices and purchase orders, matches line items, flags discrepancies, and posts results to the ERP.',
      agentPattern: 'Tool-using agent with document parsing + ERP connectors',
      automationPattern: 'Event-triggered batch + on-demand review queue',
      valueDrivers: ['Labor cost reduction', 'Error rate reduction', 'Cycle time'],
      systems: ['ERP', 'Document store'],
      technologies: ['LLM', 'OCR', 'RAG'],
      automationPotential: 0.78,
      complexity: 'Medium',
      risks: 'Mismatched line items may auto-post incorrectly.',
      controls: 'Confidence threshold + human-in-the-loop review',
      status: 'PUBLISHED',
    },
  })

  const useCase2 = await prisma.useCase.create({
    data: {
      slug: 'predictive-maintenance-scheduling',
      title: 'Predictive Maintenance Scheduling',
      industry: 'Manufacturing',
      businessFunction: 'Operations',
      problem: 'Unplanned machine downtime causes costly production delays.',
      description:
        'AI agent analyzes sensor telemetry, predicts failure windows, and proposes maintenance schedules to planners.',
      agentPattern: 'Planning agent + anomaly detection models',
      automationPattern: 'Scheduled inference + planner recommendation loop',
      valueDrivers: ['Downtime reduction', 'Asset lifespan', 'OEE'],
      systems: ['SCADA', 'CMMS'],
      technologies: ['Time-series ML', 'LLM', 'RAG'],
      automationPotential: 0.65,
      complexity: 'High',
      risks: 'False positives could over-schedule maintenance.',
      controls: 'Planner approval gate + confidence calibration',
      status: 'PUBLISHED',
    },
  })

  // DEMO news items (x2)
  const news1 = await prisma.news.create({
    data: {
      slug: 'anthropic-tool-use-claude-3-update',
      headline: 'Anthropic ships improved tool-use reliability for Claude',
      summary:
        'Anthropic released an update to Claude improving tool-calling accuracy and reducing hallucinated function arguments.',
      analysis:
        'Tool-use reliability is a key enabler for enterprise agent deployments where agents must call internal APIs correctly.',
      whyItMatters:
        'Lower hallucination rates in tool calls reduce the need for human-in-the-loop checks, improving automation ROI.',
      sourceName: 'Anthropic Blog',
      sourceUrl: 'https://www.anthropic.com/news',
      canonicalUrl: 'https://www.anthropic.com/news/claude-tool-use-update',
      publishedAt: new Date(),
      categories: ['AI Research', 'Product'],
      tags: ['tool-use', 'agents', 'reliability'],
      companies: ['Anthropic'],
      industries: ['Technology'],
      businessFunctions: ['Engineering'],
      technologies: ['LLM', 'Tool-use'],
      status: 'PUBLISHED',
    },
  })

  const news2 = await prisma.news.create({
    data: {
      slug: 'openai-enterprise-agents-framework',
      headline: 'OpenAI previews enterprise agents framework',
      summary:
        'OpenAI previewed a framework for orchestrating multi-step enterprise agents with built-in guardrails.',
      analysis:
        'Enterprise frameworks lower the barrier to building reliable agent workflows for business functions.',
      whyItMatters:
        'Standardized orchestration patterns accelerate time-to-value for agent deployments in finance and operations.',
      sourceName: 'OpenAI Blog',
      sourceUrl: 'https://openai.com/blog',
      canonicalUrl: 'https://openai.com/blog/enterprise-agents',
      publishedAt: new Date(),
      categories: ['AI Research', 'Product'],
      tags: ['orchestration', 'agents', 'enterprise'],
      companies: ['OpenAI'],
      industries: ['Technology'],
      businessFunctions: ['Engineering', 'Operations'],
      technologies: ['LLM', 'Agents'],
      status: 'PUBLISHED',
    },
  })

  // Link news to use cases (DEMO)
  await prisma.newsUseCase.createMany({
    data: [
      { newsId: news1.id, useCaseId: useCase1.id, relevanceScore: 0.82 },
      { newsId: news2.id, useCaseId: useCase2.id, relevanceScore: 0.74 },
    ],
  })

  console.log('✅ DEMO data seeded:')
  console.log('   Customer:', customer.id)
  console.log('   User:', user.id)
  console.log('   UseCases:', useCase1.id, useCase2.id)
  console.log('   News:', news1.id, news2.id)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
