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
  model: any,
  fieldName: string = 'rfqNumber'
): Promise<string> {
  const year = new Date().getFullYear();
  
  const lastRecord = await model.findFirst({
    where: {
      [fieldName]: {
        startsWith: `${prefix}-${year}-`
      }
    },
    orderBy: {
      [fieldName]: 'desc'
    }
  });

  let nextSequence = 1;
  if (lastRecord && lastRecord[fieldName]) {
    const parts = (lastRecord[fieldName] as string).split('-');
    const lastSequence = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastSequence)) {
      nextSequence = lastSequence + 1;
    }
  }

  const sequence = String(nextSequence).padStart(4, '0');
  return `${prefix}-${year}-${sequence}`;
}

export function sanitizeUser<T extends { password?: string }>(user: T): Omit<T, 'password'> {
  const { password, ...rest } = user;
  return rest;
}