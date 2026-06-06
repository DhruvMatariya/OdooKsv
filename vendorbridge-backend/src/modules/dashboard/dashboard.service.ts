import { prisma } from '../../lib/prisma';

export async function getDashboardData() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [pendingApprovals, activeRFQs, recentPurchaseOrders, recentInvoices, totalVendors, totalSpend, monthlySpend] = await Promise.all([
    prisma.approval.count({ where: { status: 'PENDING' } }),
    prisma.rfq.count({ where: { status: 'PUBLISHED' } }),
    prisma.purchaseOrder.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { quotation: { include: { vendor: true } }, vendor: true },
    }),
    prisma.invoice.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { purchaseOrder: { include: { quotation: { include: { vendor: true } }, vendor: true } } },
    }),
    prisma.vendor.count(),
    prisma.invoice.aggregate({ _sum: { grandTotal: true } }),
    prisma.invoice.aggregate({ where: { createdAt: { gte: startOfMonth } }, _sum: { grandTotal: true } }),
  ]);

  return {
    pendingApprovals,
    activeRFQs,
    recentPurchaseOrders,
    recentInvoices,
    totalVendors,
    totalSpend: totalSpend._sum.grandTotal ?? 0,
    monthlySpend: monthlySpend._sum.grandTotal ?? 0,
  };
}