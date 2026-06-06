import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: Number(process.env.SMTP_PORT),
	secure: false,
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
	},
});

export async function sendInvoiceEmail(
	to: string,
	invoiceNumber: string,
	pdfBuffer: Buffer
): Promise<void> {
	await transporter.sendMail({
		from: process.env.SMTP_FROM,
		to,
		subject: `Invoice ${invoiceNumber} from VendorBridge`,
		html: `
			<div style="font-family:Arial,sans-serif;max-width:600px">
				<h2 style="color:#2563eb">VendorBridge</h2>
				<p>Please find attached your invoice <strong>${invoiceNumber}</strong>.</p>
				<p>Thank you for your business.</p>
				<hr/>
				<p style="color:#6b7280;font-size:12px">This is an automated email from VendorBridge ERP.</p>
			</div>
		`,
		attachments: [
			{
				filename: `${invoiceNumber}.pdf`,
				content: pdfBuffer,
				contentType: 'application/pdf',
			},
		],
	});
}
