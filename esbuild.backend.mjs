import { build } from 'esbuild';

// Bundler Node-backenden (BFF) til én kjørbar ESM-fil.
// Førsteparts-kode inlines slik at directory-/extensionless-importer løses av
// esbuild i stedet for av Node runtime (som ikke lenger støtter
// --es-module-specifier-resolution=node fra og med Node 24). Avhengigheter i
// node_modules holdes eksterne og lastes normalt av Node på kjøretid.
await build({
    entryPoints: ['src/backend/server.ts'],
    outfile: 'node_dist/server.js',
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node24',
    packages: 'external',
    sourcemap: true,
    logLevel: 'info',
});
