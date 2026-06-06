import { prisma } from '../../lib/prisma';

export async function getAnalytics(period = 30) {
  const since = new Date();
  since.setDate(since.getDate() - period);

  const [vendors, rfqs, purchaseOrders, invoices, approvals] = await Promise.all([
    prisma.vendor.findMany({
      include: { quotations: { include: { purchaseOrder: true } }, purchaseOrders: true },
    }),
    prisma.rfq.findMany({ where: { createdAt: { gte: since } } }),
    prisma.purchaseOrder.findMany({ where: { createdAt: { gte: since } } }),
    prisma.invoice.findMany({ where: { createdAt: { gte: since } } }),
    prisma.approval.findMany({ where: { createdAt: { gte: since } } }),
  ]);

  const vendorPerformance = vendors.map((vendor) => {
    const totalOrders = vendor.purchaseOrders.length;
    const totalSpend = vendor.purchaseOrders.reduce((sum, order) => sum + order.grandTotal, 0);
    const avgDeliveryDays = vendor.quotations.length
      ? vendor.quotations.reduce((sum, quotation) => sum + quotation.deliveryDays, 0) / vendor.quotations.length
      : 0;

    return {
      vendorId: vendor.id,
      vendorName: vendor.name,
      totalOrders,
      totalSpend,
      avgDeliveryDays,
      rating: vendor.rating,
    };
  });

  const monthlyTrendMap = new Map<string, { month: string; rfqCount: number; poCount: number; totalSpend: number }>();
  for (let index = 11; index >= 0; index -= 1) {
    const date = new Date();
    date.setMonth(date.getMonth() - index);
    const key = date.toISOString().slice(0, 7);
    monthlyTrendMap.set(key, { month: key, rfqCount: 0, poCount: 0, totalSpend: 0 });
  }

  for (const rfq of rfqs) {
    const key = rfq.createdAt.toISOString().slice(0, 7);
    const entry = monthlyTrendMap.get(key);
    if (entry) {
      entry.rfqCount += 1;
    }
  }

  for (const purchaseOrder of purchaseOrders) {
    const key = purchaseOrder.createdAt.toISOString().slice(0, 7);
    const entry = monthlyTrendMap.get(key);
    if (entry) {
      entry.poCount += 1;
      entry.totalSpend += purchaseOrder.grandTotal;
    }
  }

  const categoryBreakdownMap = new Map<string, { category: string; vendorCount: number; totalSpend: number }>();
  for (const vendor of vendors) {
    const current = categoryBreakdownMap.get(vendor.category) ?? { category: vendor.category, vendorCount: 0, totalSpend: 0 };
    current.vendorCount += 1;
    current.totalSpend += vendor.purchaseOrders.reduce((sum, order) => sum + order.grandTotal, 0);
    categoryBreakdownMap.set(vendor.category, current);
  }

  const avgApprovalTime = approvals.length
    ? approvals.reduce((sum, approval) => {
        if (!approval.resolvedAt) {
          return sum;
        }
        return sum + (approval.resolvedAt.getTime() - approval.createdAt.getTime());
      }, 0) / Math.max(1, approvals.filter((approval) => approval.resolvedAt).length)
    : 0;

  return {
    vendorPerformance,
    monthlyTrend: Array.from(monthlyTrendMap.values()),
    categoryBreakdown: Array.from(categoryBreakdownMap.values()),
    procurementStats: {
      totalRFQs: rfqs.length,
      totalPOs: purchaseOrders.length,
      totalInvoices: invoices.length,
      avgApprovalTime,
      totalSpend: invoices.reduce((sum, invoice) => sum + invoice.grandTotal, 0),
    },
  };
}