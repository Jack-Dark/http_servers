import type { MigrationConfig } from "drizzle-orm/migrator";


type Config = {
  api: APIConfig;
  db: DBConfig;
};

type APIConfig = {
  fileServerHits: number;
  port: number;
  platform: 'dev'
};

type DBConfig = {
  url: string;
  migrationConfig: MigrationConfig;
};

process.loadEnvFile();

const envOrThrow = <T extends string>(key: string): T => {
  if (key in process.env) {
    return process.env[key] as T;
  }

  throw new Error(`"${key}" does not exist in your environment variables. Please add it and try again.`);
}

export const config = {
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
} satisfies Config
