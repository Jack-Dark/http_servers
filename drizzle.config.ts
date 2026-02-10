import { defineConfig } from "drizzle-kit";
import { config } from './src/config'

process.loadEnvFile();

export default defineConfig({
  schema: "src/schema.ts",
  out: config.db.migrationConfig.migrationsFolder,
  dialect: "postgresql",
  dbCredentials: {
    url: config.db.url,
  },
});