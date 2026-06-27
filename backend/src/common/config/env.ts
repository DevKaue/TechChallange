export function validateEnv(): void {
  const required = ['DATABASE_URL', 'JWT_SECRET'];
  const missing: string[] = [];

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`,
    );
  }
}

export function env(): {
  jwtSecret: string;
  port: number;
  databaseUrl: string;
} {
  return {
    jwtSecret: process.env.JWT_SECRET!,
    port: parseInt(process.env.PORT ?? '3000', 10),
    databaseUrl: process.env.DATABASE_URL!,
  };
}
