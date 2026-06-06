import { ApprovalStatus, InvoiceStatus, PurchaseOrderStatus, QuotationStatus, RfqStatus, UserRole, VendorCategory, VendorStatus } from '@prisma/client';
import { hashPassword } from '../src/lib/bcrypt';
import { prisma } from '../src/lib/prisma';

async function main() {
  await prisma.activityLog.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.quotationItem.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.rfqVendor.deleteMany();
  await prisma.rfqItem.deleteMany();
  await prisma.rfq.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.user.deleteMany();

  const password = await hashPassword('Password123');

  const [admin, officer, manager, vendorUser] = await Promise.all([
    prisma.user.create({ data: { firstName: 'System', lastName: 'Admin', email: 'admin@vendorbridge.com', password, role: UserRole.ADMIN } }),
    prisma.user.create({ data: { firstName: 'Procurement', lastName: 'Officer', email: 'officer@test.com', password, role: UserRole.PROCUREMENT_OFFICER } }),
    prisma.user.create({ data: { firstName: 'Operations', lastName: 'Manager', email: 'manager@test.com', password, role: UserRole.MANAGER } }),
    prisma.user.create({ data: { firstName: 'Vendor', lastName: 'User', email: 'vendor@test.com', password, role: UserRole.VENDOR } }),
  ]);

  const vendorsList = await Promise.all([
    prisma.vendor.create({ data: { name: 'TechSphere Solutions', email: 'vendor1@test.com', phone: '9876543210', address: '12 Ring Road', city: 'Bengaluru', state: 'Karnataka', gstNumber: '29ABCDE1234F1Z5', category: VendorCategory.IT, status: VendorStatus.ACTIVE, rating: 4.7, totalOrders: 0 } }),
    prisma.vendor.create({ data: { name: 'Swift Logistics', email: 'vendor2@test.com', phone: '9876543211', address: '44 Airport Road', city: 'Mumbai', state: 'Maharashtra', gstNumber: '27ABCDE1234F1Z6', category: VendorCategory.LOGISTICS, status: VendorStatus.ACTIVE, rating: 4.4, totalOrders: 3 } }),
    prisma.vendor.create({ data: { name: 'PaperTrail Supplies', email: 'vendor3@test.com', phone: '9876543212', address: '8 MG Road', city: 'Pune', state: 'Maharashtra', gstNumber: '27ABCDE1234F1Z7', category: VendorCategory.OFFICE_SUPPLIES, status: VendorStatus.INACTIVE, rating: 3.9, totalOrders: 1 } }),
    prisma.vendor.create({ data: { name: 'PrimeFab Manufacturing', email: 'vendor4@test.com', phone: '9876543213', address: '99 Industrial Area', city: 'Ahmedabad', state: 'Gujarat', gstNumber: '24ABCDE1234F1Z8', category: VendorCategory.MANUFACTURING, status: VendorStatus.ACTIVE, rating: 4.8, totalOrders: 5 } }),
  ]);

  await prisma.user.update({ where: { id: vendorUser.id }, data: { vendorId: vendorsList[0].id } });

  const publishedRfq = await prisma.rfq.create({
    data: {
      rfqNumber: 'RFQ-2026-0002',
      title: 'Office Supplies Q2',
      description: 'Paper, stationery and pantry replenishment.',
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
      status: RfqStatus.PUBLISHED,
      createdById: officer.id,
      items: {
        create: [
          { name: 'A4 Paper', description: '500 sheets pack', quantity: 100, unit: 'ream' },
          { name: 'Blue Pen', description: 'Ball pen', quantity: 500, unit: 'pcs' },
        ],
      },
      vendors: {
        create: [
          { vendorId: vendorsList[0].id },
          { vendorId: vendorsList[1].id },
        ],
      },
    },
  });

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
