declare global {
  namespace App {
    interface Platform {
      env: {
        bucket: R2Bucket;
        ASSETS: Fetcher;
      };
    }
  }
}

export {};
