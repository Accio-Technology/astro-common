// Config for the standalone playground only.
// When astro-common is consumed as a submodule at <site>/src/common,
// this file is inert: Astro only reads the config at the project root.
import { defineConfig } from 'astro/config';

export default defineConfig({
    srcDir: './playground',
    outDir: './dist-playground',
});