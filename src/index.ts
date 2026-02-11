import express from "express";
import { handlerReadiness } from "./api/readiness.js";
import { errorHandlerMiddleware, middlewareLogResponse, middlewareMetricsInc } from "./api/middleware.js";
import { handlerMetrics } from "./api/metrics.js";
import { handlerReset } from "./api/reset.js";
import { handlerCreateChirp } from "./api/chirps.js";
import type { RequestHandler } from "express";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { config } from "./config.js";
import { handlerUsersCreate } from "./api/users.js";

/** Wrap your handler function in this to ensure errors are correctly passed to express's `next`. */
const errorWrapper = (handler: RequestHandler): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next)
  }
}

const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

const app = express();


app.use(middlewareLogResponse);
app.use(express.json());

app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/api/healthz", errorWrapper(handlerReadiness));
app.get("/admin/metrics", errorWrapper(handlerMetrics));

app.post("/admin/reset", errorWrapper(handlerReset));
app.post("/api/users", errorWrapper(handlerUsersCreate));
app.post("/api/chirps", errorWrapper(handlerCreateChirp));

app.use(errorHandlerMiddleware);

app.listen(config.api.port, () => {
  console.log(`Server is running at http://localhost:${config.api.port}`);
});


