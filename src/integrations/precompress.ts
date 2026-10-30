/**
 * Writes a `.gz` next to every text asset after the build, so nginx serves
 * them with `gzip_static on` instead of compressing on each request.
 * Uses only node:zlib — no dependency.
 */
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzip } from 'node:zlib';
import { promisify } from 'node:util';
import type { AstroIntegration } from 'astro';

const gzipAsync = promisify(gzip);
const COMPRESSIBLE = /\.(html|css|js|mjs|svg|xml|txt|json|webmanifest)$/;
const MIN_BYTES = 512;

async function* walk(dir: string): AsyncGenerator<string> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else yield path;
  }
}

export function precompress(): AstroIntegration {
  return {
    name: 'recovik-precompress',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        // For server builds `dir` is the client output folder.
        const root = fileURLToPath(dir);
        let count = 0;
        for await (const file of walk(root)) {
          if (!COMPRESSIBLE.test(file) || (await stat(file)).size < MIN_BYTES) continue;
          await writeFile(`${file}.gz`, await gzipAsync(await readFile(file), { level: 9 }));
          count += 1;
        }
        logger.info(`gzip-compressed ${count} files`);
      },
    },
  };
}
