import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { errorMiddleware } from './middleware/error.middleware';

import authRouter from './modules/auth/auth.routes';
import userRouter from './modules/users/user.routes';
import vendorRouter from './modules/vendors/vendor.routes';
import rfqRouter from './modules/rfqs/rfq.routes';
import quotationRouter from './modules/quotations/quotation.routes';
import approvalRouter from './modules/approvals/approval.routes';
import poRouter from './modules/purchase-orders/po.routes';
import invoiceRouter from './modules/invoices/invoice.routes';
import dashboardRouter from './modules/dashboard/dashboard.routes';
import logRouter from './modules/activity-logs/log.routes';
import analyticsRouter from './modules/analytics/analytics.routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_, res) => res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } }));

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/vendors', vendorRouter);
app.use('/api/rfqs', rfqRouter);
app.use('/api', quotationRouter);
app.use('/api/approvals', approvalRouter);
app.use('/api/purchase-orders', poRouter);
app.use('/api/invoices', invoiceRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/activity-logs', logRouter);
app.use('/api/analytics', analyticsRouter);

app.use('*', (_, res) => res.status(404).json({ success: false, error: 'Route not found' }));
app.use(errorMiddleware);

export default app;