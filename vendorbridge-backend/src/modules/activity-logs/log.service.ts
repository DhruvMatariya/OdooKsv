import { prisma } from '../../lib/prisma';
import { parsePagination } from '../../lib/service-utils';

export async function listActivityLogs(query: { entity?: string; userId?: string; page?: string | number; limit?: string | number }) {
  const { page, limit, skip } = parsePagination(query);
  const where: Record<string, unknown> = {};

  if (query.entity) {
    where.entity = query.entity;
  }

  if (query.userId) {
    where.userId = query.userId;
  }

  const [items, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
      },
    }),
    prisma.activityLog.count({ where }),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}