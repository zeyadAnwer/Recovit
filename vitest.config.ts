/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

// Uses Astro's Vite config so `astro:*` virtual modules resolve in tests.
export default getViteConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
  },
});
