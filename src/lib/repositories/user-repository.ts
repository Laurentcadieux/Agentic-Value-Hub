/**
 * User & Customer repository — the only place issuing Prisma queries against
 * the `users` and `customers` tables for the account/auth flows. Services and
 * route handlers depend on these functions; nothing should reach for `prisma`
 * directly for user/customer data.
 */

import type { Customer, Prisma, User, UserRole } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export type { Customer, User, UserRole } from '@prisma/client'

export interface UserWithCustomer extends User {
  customer: Customer
}

export interface CreateUserInput {
  customerId: string
  email: string
  firstName?: string | null
  lastName?: string | null
  role?: UserRole
}

export interface CreateCustomerInput {
  companyName: string
  website?: string | null
  industry?: string | null
  employeeRange?: string | null
  country?: string | null
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

/** Find a user by email (case-insensitive). Returns null if not found. */
export async function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email: normalizeEmail(email) } })
}

/** Find a user by id. Returns null if not found. */
export async function findUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } })
}

/** Find a user by id together with their customer (tenant). */
export async function findUserWithCustomer(
  id: string,
): Promise<UserWithCustomer | null> {
  return prisma.user.findUnique({
    where: { id },
    include: { customer: true },
  })
}

/** Create a user. Throws on unique-email violation. */
export async function createUser(input: CreateUserInput): Promise<User> {
  return prisma.user.create({
    data: {
      customerId: input.customerId,
      email: normalizeEmail(input.email),
      firstName: input.firstName ?? undefined,
      lastName: input.lastName ?? undefined,
      role: input.role ?? 'MEMBER',
    },
  })
}

/** Update a user. */
export async function updateUser(
  id: string,
  data: Prisma.UserUpdateInput,
): Promise<User> {
  return prisma.user.update({ where: { id }, data })
}

/** Create a customer (company). */
export async function createCustomer(
  input: CreateCustomerInput,
): Promise<Customer> {
  return prisma.customer.create({
    data: {
      companyName: input.companyName,
      website: input.website ?? undefined,
      industry: input.industry ?? undefined,
      employeeRange: input.employeeRange ?? undefined,
      country: input.country ?? undefined,
    },
  })
}

/** Find a customer by id. */
export async function findCustomerById(id: string): Promise<Customer | null> {
  return prisma.customer.findUnique({ where: { id } })
}

/** List all users belonging to a customer (tenant). */
export async function listUsersByCustomer(customerId: string): Promise<User[]> {
  return prisma.user.findMany({
    where: { customerId },
    orderBy: { createdAt: 'asc' },
  })
}
