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
    prisma.user.create({ data: { name: 'System Admin', email: 'admin@vendorbridge.com', password, role: UserRole.ADMIN } }),
    prisma.user.create({ data: { name: 'Procurement Officer', email: 'officer@test.com', password, role: UserRole.PROCUREMENT_OFFICER } }),
    prisma.user.create({ data: { name: 'Operations Manager', email: 'manager@test.com', password, role: UserRole.MANAGER } }),
    prisma.user.create({ data: { name: 'Vendor User', email: 'vendor@test.com', password, role: UserRole.VENDOR } }),
  ]);

  const vendors = await Promise.all([
    prisma.vendor.create({ data: { name: 'TechSphere Solutions', email: 'vendor@test.com', phone: '9876543210', address: '12 Ring Road', city: 'Bengaluru', state: 'Karnataka', gstNumber: '29ABCDE1234F1Z5', category: VendorCategory.IT, status: VendorStatus.ACTIVE, rating: 4.7, totalOrders: 0 } }),
    prisma.vendor.create({ data: { name: 'Swift Logistics', email: 'swift@vendors.com', phone: '9876543211', address: '44 Airport Road', city: 'Mumbai', state: 'Maharashtra', gstNumber: '27ABCDE1234F1Z6', category: VendorCategory.LOGISTICS, status: VendorStatus.ACTIVE, rating: 4.4, totalOrders: 3 } }),
    prisma.vendor.create({ data: { name: 'PaperTrail Supplies', email: 'papertrail@vendors.com', phone: '9876543212', address: '8 MG Road', city: 'Pune', state: 'Maharashtra', gstNumber: '27ABCDE1234F1Z7', category: VendorCategory.OFFICE_SUPPLIES, status: VendorStatus.INACTIVE, rating: 3.9, totalOrders: 1 } }),
    prisma.vendor.create({ data: { name: 'PrimeFab Manufacturing', email: 'primefab@vendors.com', phone: '9876543213', address: '99 Industrial Area', city: 'Ahmedabad', state: 'Gujarat', gstNumber: '24ABCDE1234F1Z8', category: VendorCategory.MANUFACTURING, status: VendorStatus.ACTIVE, rating: 4.8, totalOrders: 5 } }),
    prisma.vendor.create({ data: { name: 'CloudNexus IT', email: 'cloudnexus@vendors.com', phone: '9876543214', address: '21 Tech Park', city: 'Hyderabad', state: 'Telangana', gstNumber: '36ABCDE1234F1Z9', category: VendorCategory.IT, status: VendorStatus.ACTIVE, rating: 4.2, totalOrders: 2 } }),
    prisma.vendor.create({ data: { name: 'Metro Freight', email: 'metrofreight@vendors.com', phone: '9876543215', address: '15 Dock Street', city: 'Chennai', state: 'Tamil Nadu', gstNumber: '33ABCDE1234F1Z1', category: VendorCategory.LOGISTICS, status: VendorStatus.INACTIVE, rating: 3.8, totalOrders: 2 } }),
    prisma.vendor.create({ data: { name: 'OfficeNest', email: 'officenest@vendors.com', phone: '9876543216', address: '101 City Center', city: 'Delhi', state: 'Delhi', gstNumber: '07ABCDE1234F1Z2', category: VendorCategory.OFFICE_SUPPLIES, status: VendorStatus.ACTIVE, rating: 4.0, totalOrders: 4 } }),
    prisma.vendor.create({ data: { name: 'ForgeLine', email: 'forgeline@vendors.com', phone: '9876543217', address: '77 Foundry Lane', city: 'Surat', state: 'Gujarat', gstNumber: '24ABCDE1234F1Z3', category: VendorCategory.MANUFACTURING, status: VendorStatus.ACTIVE, rating: 4.6, totalOrders: 1 } }),
  ]);

  await prisma.user.update({ where: { id: vendorUser.id }, data: { vendorId: vendors[0].id } });

  const draftRfq = await prisma.rfq.create({
    data: {
      rfqNumber: 'RFQ-2026-0001',
      title: 'Laptop and Accessories Refresh',
      description: 'Replacement laptops and accessories for engineering team.',
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15),
      status: RfqStatus.DRAFT,
      createdById: officer.id,
      items: {
        create: [
          { name: 'Laptop', description: '14 inch business laptop', quantity: 12, unit: 'pcs' },
          { name: 'Docking Station', description: 'USB-C dock', quantity: 12, unit: 'pcs' },
        ],
      },
      vendors: {
        create: [
          { vendorId: vendors[0].id },
          { vendorId: vendors[4].id },
        ],
      },
    },
  });

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
          { name: 'Stapler', description: 'Standard stapler', quantity: 25, unit: 'pcs' },
        ],
      },
      vendors: {
        create: [
          { vendorId: vendors[2].id },
          { vendorId: vendors[6].id },
          { vendorId: vendors[0].id },
        ],
      },
    },
  });

  const closedRfq = await prisma.rfq.create({
    data: {
      rfqNumber: 'RFQ-2026-0003',
      title: 'Manufacturing Spares Procurement',
      description: 'Critical spares for production line maintenance.',
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
      status: RfqStatus.CLOSED,
      createdById: officer.id,
      items: {
        create: [
          { name: 'Hydraulic Pump', description: 'Industrial grade pump', quantity: 6, unit: 'pcs' },
          { name: 'Bearing Set', description: 'High tolerance bearing set', quantity: 20, unit: 'set' },
          { name: 'Control Panel', description: 'PLC control panel', quantity: 4, unit: 'pcs' },
        ],
      },
      vendors: {
        create: [
          { vendorId: vendors[0].id },
          { vendorId: vendors[3].id },
          { vendorId: vendors[7].id },
        ],
      },
    },
  });

  const closedRfqItems = await prisma.rfqItem.findMany({ where: { rfqId: closedRfq.id }, orderBy: { createdAt: 'asc' } });

  const quotationOne = await prisma.quotation.create({
    data: {
      quotationNumber: 'QT-2026-0001',
      rfqId: closedRfq.id,
      vendorId: vendors[0].id,
      totalAmount: 425000,
      deliveryDays: 12,
      validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      notes: 'Includes installation support',
      status: QuotationStatus.SUBMITTED,
      items: {
        create: [
          { rfqItemName: closedRfqItems[0].name, quantity: 6, unitPrice: 50000, totalPrice: 300000 },
          { rfqItemName: closedRfqItems[1].name, quantity: 20, unitPrice: 5000, totalPrice: 100000 },
          { rfqItemName: closedRfqItems[2].name, quantity: 4, unitPrice: 6250, totalPrice: 25000 },
        ],
      },
    },
  });

  const quotationTwo = await prisma.quotation.create({
    data: {
      quotationNumber: 'QT-2026-0002',
      rfqId: closedRfq.id,
      vendorId: vendors[3].id,
      totalAmount: 398000,
      deliveryDays: 9,
      validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 28),
      notes: 'Priority delivery available',
      status: QuotationStatus.SUBMITTED,
      items: {
        create: [
          { rfqItemName: closedRfqItems[0].name, quantity: 6, unitPrice: 47000, totalPrice: 282000 },
          { rfqItemName: closedRfqItems[1].name, quantity: 20, unitPrice: 4600, totalPrice: 92000 },
          { rfqItemName: closedRfqItems[2].name, quantity: 4, unitPrice: 6000, totalPrice: 24000 },
        ],
      },
    },
  });

  const approval = await prisma.approval.create({
    data: {
      rfqId: closedRfq.id,
      approverId: manager.id,
      status: ApprovalStatus.APPROVED,
      remarks: 'Approved after vendor comparison',
      resolvedAt: new Date(),
    },
  });

  const purchaseOrder = await prisma.purchaseOrder.create({
    data: {
      poNumber: 'PO-2026-0001',
      quotationId: quotationTwo.id,
      vendorId: vendors[3].id,
      deliveryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 18),
      terms: 'Net 30',
      taxRate: 18,
      taxAmount: quotationTwo.totalAmount * 0.18,
      totalAmount: quotationTwo.totalAmount,
      grandTotal: quotationTwo.totalAmount * 1.18,
      status: PurchaseOrderStatus.CONFIRMED,
    },
  });

  await prisma.quotation.update({ where: { id: quotationTwo.id }, data: { status: QuotationStatus.ACCEPTED } });
  await prisma.vendor.update({ where: { id: vendors[3].id }, data: { totalOrders: { increment: 1 } } });

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-0001',
      purchaseOrderId: purchaseOrder.id,
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
      subtotal: purchaseOrder.totalAmount,
      taxRate: 18,
      taxAmount: purchaseOrder.taxAmount,
      grandTotal: purchaseOrder.grandTotal,
      status: InvoiceStatus.DRAFT,
    },
  });

  const activityLogs = [
    { userId: officer.id, action: 'RFQ_CREATED', entity: 'Rfq', entityId: draftRfq.id, description: 'Draft RFQ created' },
    { userId: officer.id, action: 'RFQ_CREATED', entity: 'Rfq', entityId: publishedRfq.id, description: 'Published RFQ created' },
    { userId: officer.id, action: 'RFQ_PUBLISHED', entity: 'Rfq', entityId: publishedRfq.id, description: 'Published RFQ published' },
    { userId: officer.id, action: 'RFQ_CREATED', entity: 'Rfq', entityId: closedRfq.id, description: 'Closed RFQ created' },
    { userId: officer.id, action: 'RFQ_CLOSED', entity: 'Rfq', entityId: closedRfq.id, description: 'Closed RFQ closed' },
    { userId: vendorUser.id, action: 'QUOTATION_SUBMITTED', entity: 'Quotation', entityId: quotationOne.id, description: 'Vendor quotation submitted' },
    { userId: vendorUser.id, action: 'QUOTATION_SUBMITTED', entity: 'Quotation', entityId: quotationTwo.id, description: 'Vendor quotation submitted' },
    { userId: manager.id, action: 'APPROVAL_APPROVED', entity: 'Approval', entityId: approval.id, description: 'Approval approved' },
    { userId: officer.id, action: 'PO_CREATED', entity: 'PurchaseOrder', entityId: purchaseOrder.id, description: 'Purchase order created' },
    { userId: officer.id, action: 'INVOICE_CREATED', entity: 'Invoice', entityId: invoice.id, description: 'Invoice created' },
  ];

  await prisma.activityLog.createMany({ data: activityLogs });

  console.log('Seed completed successfully');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
