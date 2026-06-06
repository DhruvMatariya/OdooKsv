import { UserRole } from '@prisma/client';
import { prisma } from '../../lib/prisma';

export async function getDashboardData(user: { id: string; role: UserRole; vendorId?: string | null }) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const whereApprovals: any = { status: 'PENDING' };
  const whereRFQs: any = {};
  const wherePOs: any = {};
  const whereInvoices: any = {};

  if (user.role === UserRole.MANAGER) {
    whereApprovals.approverId = user.id;
  } else if (user.role === UserRole.PROCUREMENT_OFFICER) {
    whereRFQs.createdById = user.id;
    wherePOs.quotation = { rfq: { createdById: user.id } };
    whereInvoices.purchaseOrder = { quotation: { rfq: { createdById: user.id } } };
  } else if (user.role === UserRole.VENDOR) {
    if (user.vendorId) {
      whereRFQs.vendors = { some: { vendorId: user.vendorId } };
      whereRFQs.status = 'PUBLISHED';
      wherePOs.vendorId = user.vendorId;
      whereInvoices.purchaseOrder = { vendorId: user.vendorId };
    }
  }

  const [
    pendingApprovalsCount,
    activeRFQs,
    recentPurchaseOrders,
    recentInvoices,
    totalVendors,
    totalSpend,
    monthlySpend,
    recentApprovals,
  ] = await Promise.all([
    prisma.approval.count({ where: whereApprovals }),
    prisma.rfq.count({ where: { ...whereRFQs, status: 'PUBLISHED' } }),
    prisma.purchaseOrder.findMany({
      where: wherePOs,
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { quotation: { include: { rfq: true, vendor: true } }, vendor: true },
    }),
    prisma.invoice.findMany({
      where: whereInvoices,
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { purchaseOrder: { include: { quotation: { include: { rfq: true, vendor: true } }, vendor: true } } },
    }),
    prisma.vendor.count(),
    prisma.invoice.aggregate({ 
      where: whereInvoices,
      _sum: { grandTotal: true } 
    }),
    prisma.invoice.aggregate({ 
      where: { ...whereInvoices, createdAt: { gte: startOfMonth } }, 
      _sum: { grandTotal: true } 
    }),
    user.role === UserRole.MANAGER || user.role === UserRole.ADMIN 
      ? prisma.approval.findMany({
          where: whereApprovals,
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { rfq: { include: { createdBy: true } } }
        })
      : Promise.resolve([]),
  ]);

  return {
    pendingApprovals: pendingApprovalsCount,
    activeRFQs,
    recentPurchaseOrders,
    recentInvoices,
    totalVendors,
    totalSpend: totalSpend._sum.grandTotal ?? 0,
    monthlySpend: monthlySpend._sum.grandTotal ?? 0,
    recentApprovals,
  };
}