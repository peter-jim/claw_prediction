export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable must be set in production');
    }
    // Dev-only fallback — not safe for production
    return 'dev-only-insecure-secret';
  }
  return secret;
}
