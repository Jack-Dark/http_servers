type APIConfig = {
  fileserverHits: number;
  dbURL: string;
};

process.loadEnvFile();

const envOrThrow = (key: string) => {
  if (key in process.env) {
    return process.env[key];
  }

  throw new Error(`"${key}" does not exist in your environment variables. Please add it and try again.`);
}

export const config: APIConfig = {
  fileserverHits: 0,
  dbURL: envOrThrow('DB_URL') || ''
}