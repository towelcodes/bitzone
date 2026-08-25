import type { FilesRepo } from "./files-repo";
import { D1FilesRepo } from "./d1-files-repo";

/**
 * Build the `FilesRepo` for the current platform.
 *
 * This is the single place that knows which database is in use, so the rest
 * of the app stays database-agnostic.
 */
export function getFilesRepo(platform: App.Platform | undefined): FilesRepo {
  if (!platform) {
    throw new Error("FilesRepo requires a platform (Cloudflare) binding");
  }
  return new D1FilesRepo(platform.env.db);
}