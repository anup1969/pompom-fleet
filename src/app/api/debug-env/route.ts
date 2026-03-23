export async function GET() {
  const secret = process.env.FLEET_JWT_SECRET || '';
  return Response.json({
    has_secret: !!secret,
    secret_length: secret.length,
    secret_first_8: secret.substring(0, 8),
    secret_last_8: secret.substring(secret.length - 8),
  });
}
