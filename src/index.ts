import express from "express";
import { handlerReadiness } from "./api/readiness.js";
import { errorMiddleWare, middlewareLogResponse, middlewareMetricsInc } from "./api/middleware.js";
import { handlerMetrics } from "./api/metrics.js";
import { handlerReset } from "./api/reset.js";
import { handlerGetChirp, handlerChirpsCreate, handlerGetAllChirps, handlerChirpsDelete } from "./api/chirps.js";
import type { RequestHandler } from "express";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { config } from "./config.js";
import { handlerUsersCreate, handlerUsersUpdate } from "./api/users.js";
import { handlerRefreshToken, handlerLogin, handlerRevokeToken } from "./api/auth.js";
import { ParamsDictionary } from "express-serve-static-core";

/** Wrap your handler function in this to ensure errors are correctly passed to express's `next`. */
const errorWrapper = <T extends ParamsDictionary>(handler: RequestHandler<T>): RequestHandler<T> => {
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
app.put("/api/users", errorWrapper(handlerUsersUpdate));
app.post("/api/login", errorWrapper(handlerLogin));
app.post("/api/refresh", errorWrapper(handlerRefreshToken));
app.post("/api/revoke", errorWrapper(handlerRevokeToken));

app.post("/api/chirps", errorWrapper(handlerChirpsCreate));
app.get("/api/chirps", errorWrapper(handlerGetAllChirps));
app.get("/api/chirps/:chirpId", errorWrapper(handlerGetChirp))
app.delete("/api/chirps/:chirpId", errorWrapper(handlerChirpsDelete))

app.use(errorMiddleWare);

app.listen(config.api.port, () => {
  console.log(`Server is running at http://localhost:${config.api.port}`);
});


