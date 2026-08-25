import type { D1Database } from "@cloudflare/workers-types";
import type { FileMeta, FilesRepo } from "./files-repo";

export class D1FilesRepo implements FilesRepo {
  constructor(private db: D1Database) {}

  async create(meta: FileMeta): Promise<void> {
    await this.db
      .prepare(
        `INSERT INTO files (
           key, filename, size, content_type, uploader_id,
           title, description, expires_at, created_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        meta.key,
        meta.filename,
        meta.size,
        meta.contentType,
        meta.uploaderId,
        meta.title ?? null,
        meta.description ?? null,
        meta.expiresAt ?? null,
        meta.createdAt,
      )
      .run();
  }

  async get(key: string): Promise<FileMeta | null> {
    const row = await this.db
      .prepare(
        `SELECT key, filename, size, content_type, uploader_id,
                title, description, expires_at, created_at
         FROM files WHERE key = ?`,
      )
      .bind(key)
      .first<Row>();

    if (!row) return null;
    return rowToMeta(row);
  }

  async listExpired(now: number): Promise<FileMeta[]> {
    const { results } = await this.db
      .prepare(
        `SELECT key, filename, size, content_type, uploader_id,
                title, description, expires_at, created_at
         FROM files WHERE expires_at IS NOT NULL AND expires_at <= ?`,
      )
      .bind(now)
      .all<Row>();

    return results.map(rowToMeta);
  }

  async delete(key: string): Promise<void> {
    await this.db.prepare(`DELETE FROM files WHERE key = ?`).bind(key).run();
  }
}

interface Row {
  key: string;
  filename: string;
  size: number;
  content_type: string;
  uploader_id: string;
  title: string | null;
  description: string | null;
  expires_at: number | null;
  created_at: number;
}

function rowToMeta(row: Row): FileMeta {
  return {
    key: row.key,
    filename: row.filename,
    size: row.size,
    contentType: row.content_type,
    uploaderId: row.uploader_id,
    title: row.title ?? undefined,
    description: row.description ?? undefined,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  };
}