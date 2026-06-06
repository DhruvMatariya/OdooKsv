import app from './app';

const PORT = process.env.PORT || 3001;

if (require.main === module) {
	app.listen(PORT, () => console.log(`VendorBridge API running on http://localhost:${PORT}`));
}

export default app;