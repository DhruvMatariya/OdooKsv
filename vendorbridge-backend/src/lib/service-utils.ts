export interface PaginationInput {
  page?: string | number;
  limit?: string | number;
}

export function parsePagination(query: PaginationInput): { page: number; limit: number; skip: number } {
  const page = Math.max(1, Number(query.page ?? 1) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit ?? 10) || 10));

  return { page, limit, skip: (page - 1) * limit };
}

export async function generateNumber(
  prefix: string,
  model: { count: () => Promise<number> }
): Promise<string> {
  const year = new Date().getFullYear();
  const count = await model.count();
  const sequence = String(count + 1).padStart(4, '0');
  return `${prefix}-${year}-${sequence}`;
}

export function sanitizeUser<T extends { password?: string }>(user: T): Omit<T, 'password'> {
  const { password, ...rest } = user;
  return rest;
}