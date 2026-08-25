import { R2Bucket, Fetcher } from "@cloudflare/workers-types";
declare global {
  namespace App {
    interface Platform {
      env: {
        bucket: R2Bucket;
        ASSETS: Fetcher;
        DB: D1Database;
      };
    }
  }
}

export {};
