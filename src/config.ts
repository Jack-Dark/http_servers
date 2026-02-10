import type { MigrationConfig } from "drizzle-orm/migrator";


type Config = {
  api: APIConfig;
  db: DBConfig;
};

type APIConfig = {
  fileServerHits: number;
  port: number;
};

type DBConfig = {
  url: string;
  migrationConfig: MigrationConfig;
};

process.loadEnvFile();

const envOrThrow = (key: string) => {
  if (key in process.env) {
    return process.env[key];
  }

  throw new Error(`"${key}" does not exist in your environment variables. Please add it and try again.`);
}

export const config = {
  api: {
    fileServerHits: 0,
    port: Number(envOrThrow("PORT")),
  },
  db: {
    url: envOrThrow('DB_URL') || '',
    migrationConfig: {
      migrationsFolder: "./src/db/migrations" as const,
    },
  },
} satisfies Config
