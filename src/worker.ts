import type {
  ExecutionContext,
  ScheduledEvent,
} from "@cloudflare/workers-types";

/**
 * Cloudflare Worker entrypoint merged into the SvelteKit worker by
 * `@sveltejs/adapter-cloudflare`. The `scheduled` handler runs on the cron
 * trigger configured in wrangler.jsonc and deletes expired files.
 */
export default {
  async scheduled(
    _event: ScheduledEvent,
    env: App.Platform["env"],
    ctx: ExecutionContext,
  ) {
    const now = Date.now();

    const { results } = await env.db
      .prepare(
        `SELECT key FROM files WHERE expires_at IS NOT NULL AND expires_at <= ?`,
      )
      .bind(now)
      .all();

    let deleted = 0;
    let failed = 0;

    for (const row of results) {
      try {
        await env.bucket.delete(row.key);
        await env.db
          .prepare(`DELETE FROM files WHERE key = ?`)
          .bind(row.key)
          .run();
        deleted++;
      } catch (e) {
        failed++;
        console.error(`Failed to expire ${row.key}:`, e);
      }
    }

    console.log(`Expiry cleanup: ${deleted} deleted, ${failed} failed`);
    ctx.waitUntil(Promise.resolve());
  },
};