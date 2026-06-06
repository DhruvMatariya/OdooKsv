import jwt from 'jsonwebtoken';

export function signToken(payload: object): string {
	const secret = String(process.env.JWT_SECRET || 'development-secret');
	const expiresIn = (process.env.JWT_EXPIRES_IN || '8h') as jwt.SignOptions['expiresIn'];
	return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string): any {
	const secret = String(process.env.JWT_SECRET || 'development-secret');
	return jwt.verify(token, secret);
}
