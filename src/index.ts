import express from "express";
import { handlerReadiness } from "./api/readiness.js";
import { errorHandler, middlewareLogResponse, middlewareMetricsInc } from "./api/middleware.js";
import { handlerMetrics } from "./api/metrics.js";
import { handlerReset } from "./api/reset.js";
import { handlerChirpsValidate } from "./api/chirps.js";
import type { RequestHandler } from "express";

const errorWrapper = (handler: RequestHandler): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next)
  }
}

const app = express();
const PORT = 8080;


app.use(middlewareLogResponse);
app.use(express.json());

app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/api/healthz", errorWrapper(handlerReadiness));
app.get("/admin/metrics", errorWrapper(handlerMetrics));

app.post("/admin/reset", errorWrapper(handlerReset));
app.post("/api/validate_chirp", errorWrapper(handlerChirpsValidate));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});


