import { defineConfig } from "drizzle-kit";
import { config } from './src/config'

process.loadEnvFile();

export default defineConfig({
  schema: "src/schema.ts",
  out: "src/db",
  dialect: "postgresql",
  dbCredentials: {
    url: config.dbURL,
  },
});