import type { MigrationConfig } from "drizzle-orm/migrator";


type Config = {
  api: APIConfig;
  db: DBConfig;
  jwt: JWTConfig;
  token: RefreshTokenConfig;
};

type APIConfig = {
  fileServerHits: number;
  platform: 'dev',
  port: number;
};

type DBConfig = {
  url: string;
  migrationConfig: MigrationConfig;
};

type JWTConfig = {
  /** In seconds */
  defaultDuration: number;
  secret: string;
  issuer: string;
};

type RefreshTokenConfig = {
  durationDays: number
}

process.loadEnvFile();

const envOrThrow = <T extends string>(key: string): T => {
  if (key in process.env) {
    return process.env[key] as T;
  }

  throw new Error(`"${key}" does not exist in your environment variables. Please add it and try again.`);
}

export const config: Config = {
  api: {
    fileServerHits: 0,
    platform: envOrThrow("PLATFORM"),
    port: Number(envOrThrow("PORT")),
  },
  db: {
    url: envOrThrow('DB_URL'),
    migrationConfig: {
      migrationsFolder: "./src/db/migrations" as const,
    },
  },
  jwt: {
    defaultDuration: 3600,
    secret: envOrThrow("SECRET"),
    issuer: 'chirpy'
  },
  token: {
    durationDays: 60
  }
};
