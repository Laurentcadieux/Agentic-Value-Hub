import { prisma } from '@/lib/prisma'
import type { Customer } from '@prisma/client'
import { Prisma } from '@prisma/client'

/**
 * Phase 7 — Customer repository.
 *
 * Encapsulates all customer CRUD used by the admin customer-management
 * pages and server actions. Queries are read against PostgreSQL via Prisma;
 * string filters use case-insensitive `contains`.
 */

export type CustomerWithCounts = Prisma.CustomerGetPayload<{
  include: {
    _count: {
      select: {
        users: true
        ideas: true
        useCases: true
        news: true
        conversations: true
      }
    }
  }
}>

export type CustomerDetail = Prisma.CustomerGetPayload<{
  include: {
    users: true
    ideas: { orderBy: { createdAt: 'desc' } }
    _count: {
      select: {
        useCases: true
        news: true
        conversations: true
      }
    }
  }
}>

export interface CustomerListInput {
  search?: string
  skip?: number
  take?: number
}

export interface CustomerListResult {
  items: CustomerWithCounts[]
  total: number
}

export async function listCustomers(
  input: CustomerListInput = {},
): Promise<CustomerListResult> {
  const { search, skip = 0, take = 50 } = input

  const where: Prisma.CustomerWhereInput = search
    ? {
        OR: [
          { companyName: { contains: search, mode: 'insensitive' } },
          { website: { contains: search, mode: 'insensitive' } },
          { industry: { contains: search, mode: 'insensitive' } },
          { country: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {}

  const [items, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            users: true,
            ideas: true,
            useCases: true,
            news: true,
            conversations: true,
          },
        },
      },
    }),
    prisma.customer.count({ where }),
  ])

  return { items, total }
}

export async function getCustomerById(id: string): Promise<CustomerDetail | null> {
  return prisma.customer.findUnique({
    where: { id },
    include: {
      users: { orderBy: { createdAt: 'desc' } },
      ideas: { orderBy: { createdAt: 'desc' }, take: 50 },
      _count: {
        select: {
          useCases: true,
          news: true,
          conversations: true,
        },
      },
    },
  })
}

export interface CustomerCreateInput {
  companyName: string
  website?: string | null
  industry?: string | null
  employeeRange?: string | null
  country?: string | null
}

export async function createCustomer(
  input: CustomerCreateInput,
): Promise<Customer> {
  return prisma.customer.create({
    data: {
      companyName: input.companyName,
      website: input.website ?? null,
      industry: input.industry ?? null,
      employeeRange: input.employeeRange ?? null,
      country: input.country ?? null,
    },
  })
}

export interface CustomerUpdateInput {
  companyName?: string
  website?: string | null
  industry?: string | null
  employeeRange?: string | null
  country?: string | null
}

export async function updateCustomer(
  id: string,
  input: CustomerUpdateInput,
): Promise<Customer> {
  return prisma.customer.update({
    where: { id },
    data: {
      companyName: input.companyName,
      website: input.website,
      industry: input.industry,
      employeeRange: input.employeeRange,
      country: input.country,
    },
  })
}

export async function deleteCustomer(id: string): Promise<Customer> {
  return prisma.customer.delete({ where: { id } })
}

export async function countCustomers(): Promise<number> {
  return prisma.customer.count()
}
