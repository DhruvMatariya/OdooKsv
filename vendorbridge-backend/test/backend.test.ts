import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import app from '../src/app';

type TestResult = {
	name: string;
	status: 'passed' | 'failed';
	message?: string;
};

type JsonResponse = {
	status: number;
	body: unknown;
};

async function requestJson(baseUrl: string, route: string, init?: RequestInit): Promise<JsonResponse> {
	const response = await fetch(`${baseUrl}${route}`, {
		headers: {
			'content-type': 'application/json',
			...(init?.headers ?? {}),
		},
		...init,
	});

	const text = await response.text();
	const body = text.length > 0 ? JSON.parse(text) : null;

	return { status: response.status, body };
}

async function main(): Promise<void> {
	const tempDir = await mkdtemp(path.join(os.tmpdir(), 'vendorbridge-backend-test-'));
	const outputDir = path.resolve(process.cwd(), 'output');
	const reportPath = path.join(outputDir, 'backend-test-report.txt');
	const server = app.listen(0);
	const results: TestResult[] = [];

	try {
		await mkdir(outputDir, { recursive: true });

		const address = server.address();
		if (!address || typeof address === 'string') {
			throw new Error('Failed to start test server');
		}

		const baseUrl = `http://127.0.0.1:${address.port}`;

		const smokeTests: Array<{ name: string; route: string; init?: RequestInit; expectedStatus: number; expectedError?: string; expectedSuccess?: boolean }> = [
			{ name: 'GET /health returns ok', route: '/health', expectedStatus: 200, expectedSuccess: true },
			{ name: 'POST /api/auth/register validates required fields', route: '/api/auth/register', init: { method: 'POST', body: JSON.stringify({}) }, expectedStatus: 400, expectedError: 'Validation failed' },
			{ name: 'POST /api/auth/login validates required fields', route: '/api/auth/login', init: { method: 'POST', body: JSON.stringify({}) }, expectedStatus: 400, expectedError: 'Validation failed' },
			{ name: 'GET /api/auth/me rejects missing token', route: '/api/auth/me', expectedStatus: 401, expectedError: 'Invalid or expired token' },
			{ name: 'GET /api/vendors requires auth', route: '/api/vendors', expectedStatus: 401, expectedError: 'Invalid or expired token' },
			{ name: 'POST /api/vendors requires auth', route: '/api/vendors', init: { method: 'POST', body: JSON.stringify({}) }, expectedStatus: 401, expectedError: 'Invalid or expired token' },
			{ name: 'GET /api/rfqs requires auth', route: '/api/rfqs', expectedStatus: 401, expectedError: 'Invalid or expired token' },
			{ name: 'POST /api/rfqs requires auth', route: '/api/rfqs', init: { method: 'POST', body: JSON.stringify({}) }, expectedStatus: 401, expectedError: 'Invalid or expired token' },
			{ name: 'GET /api/rfqs/1/quotations requires auth', route: '/api/rfqs/1/quotations', expectedStatus: 401, expectedError: 'Invalid or expired token' },
			{ name: 'POST /api/rfqs/1/quotations requires auth', route: '/api/rfqs/1/quotations', init: { method: 'POST', body: JSON.stringify({}) }, expectedStatus: 401, expectedError: 'Invalid or expired token' },
			{ name: 'GET /api/approvals/1 requires auth', route: '/api/approvals/1', expectedStatus: 401, expectedError: 'Invalid or expired token' },
			{ name: 'POST /api/approvals requires auth', route: '/api/approvals', init: { method: 'POST', body: JSON.stringify({}) }, expectedStatus: 401, expectedError: 'Invalid or expired token' },
			{ name: 'GET /api/purchase-orders requires auth', route: '/api/purchase-orders', expectedStatus: 401, expectedError: 'Invalid or expired token' },
			{ name: 'POST /api/purchase-orders requires auth', route: '/api/purchase-orders', init: { method: 'POST', body: JSON.stringify({}) }, expectedStatus: 401, expectedError: 'Invalid or expired token' },
			{ name: 'GET /api/invoices/1 requires auth', route: '/api/invoices/1', expectedStatus: 401, expectedError: 'Invalid or expired token' },
			{ name: 'POST /api/invoices requires auth', route: '/api/invoices', init: { method: 'POST', body: JSON.stringify({}) }, expectedStatus: 401, expectedError: 'Invalid or expired token' },
			{ name: 'GET /api/dashboard requires auth', route: '/api/dashboard', expectedStatus: 401, expectedError: 'Invalid or expired token' },
			{ name: 'GET /api/activity-logs requires auth', route: '/api/activity-logs', expectedStatus: 401, expectedError: 'Invalid or expired token' },
			{ name: 'GET /api/analytics requires auth', route: '/api/analytics', expectedStatus: 401, expectedError: 'Invalid or expired token' },
			{ name: 'GET unknown route returns not found', route: '/does-not-exist', expectedStatus: 404, expectedError: 'Route not found' },
		];

		for (const smokeTest of smokeTests) {
			await runTest(results, smokeTest.name, async () => {
				const response = await requestJson(baseUrl, smokeTest.route, smokeTest.init);
				assert.equal(response.status, smokeTest.expectedStatus);

				if (smokeTest.expectedSuccess !== undefined) {
					assert.equal((response.body as { success?: boolean } | null)?.success, smokeTest.expectedSuccess);
				}

				if (smokeTest.expectedError) {
					assert.equal((response.body as { error?: string } | null)?.error, smokeTest.expectedError);
				}
			});
		}

		const passed = results.filter((result) => result.status === 'passed').length;
		const failed = results.filter((result) => result.status === 'failed').length;
		const reportLines = [
			'VendorBridge backend test report',
			`Run time: ${new Date().toISOString()}`,
			`Temporary directory: ${tempDir}`,
			`Passed: ${passed}`,
			`Failed: ${failed}`,
			'',
			...results.map((result) => `${result.status.toUpperCase()}: ${result.name}${result.message ? ` - ${result.message}` : ''}`),
		];

		await writeFile(reportPath, reportLines.join('\n'), 'utf8');

		console.log(reportLines.join('\n'));

		if (failed > 0) {
			process.exitCode = 1;
		}
	} catch (error) {
		const message = error instanceof Error ? error.stack ?? error.message : String(error);
		await mkdir(outputDir, { recursive: true });
		await writeFile(reportPath, `VendorBridge backend test report\n\nFatal error:\n${message}\n`, 'utf8');
		console.error(message);
		process.exitCode = 1;
	} finally {
		server.close();
	}
}

async function runTest(results: TestResult[], name: string, testFn: () => Promise<void>): Promise<void> {
	try {
		await testFn();
		results.push({ name, status: 'passed' });
		console.log(`PASS ${name}`);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		results.push({ name, status: 'failed', message });
		console.log(`FAIL ${name}: ${message}`);
	}
}

void main();