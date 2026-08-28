/**
 * Metadata associated with an uploaded object.
 *
 * `expiresAt` is an epoch timestamp (ms). `null`/`undefined` means the file
 * never expires. Keeping this in a database (rather than S3 metadata) lets us
 * query for expired files cheaply and list files by owner.
 */
export interface FileMeta {
  key: string;
  filename: string;
  size: number;
  contentType: string;
  uploaderId: string;
  title?: string;
  description?: string;
  expiresAt?: number | null;
  createdAt: number;
}

/**
 * The persistence contract the rest of the app depends on.
 *
 * Implementations are database-specific (e.g. D1, Postgres, SQLite) but the
 * application code only ever talks to this interface, so swapping the
 * underlying database is a one-file change.
 */
export interface FilesRepo {
  /** Store metadata for a newly uploaded object. */
  create(meta: FileMeta): Promise<void>;

  /** Fetch metadata for a single key, or null if it doesn't exist. */
  get(key: string): Promise<FileMeta | null>;

  /** Return all files that have expired at or before `now` (epoch ms). */
  listExpired(now: number): Promise<FileMeta[]>;

  /** Remove the metadata row for a key. */
  delete(key: string): Promise<void>;
}