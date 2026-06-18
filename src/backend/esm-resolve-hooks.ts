import type { ResolveFnOutput, ResolveHook, ResolveHookContext } from 'node:module';

// Node sin ESM-resolver krever eksplisitt filendelse og støtter ikke mappe-importer
// (f.eks. `import backend from './backend'`). tsc med moduleResolution 'bundler'
// genererer slike importer i den kompilerte koden. Denne resolve-hooken legger til
// `.js`/`/index.js` ved behov, slik at vi slipper ts-node (som trigger DEP0180
// fs.Stats-deprecation).
export const resolve: ResolveHook = async (
    specifier: string,
    context: ResolveHookContext,
    nextResolve: (
        specifier: string,
        context?: ResolveHookContext
    ) => ResolveFnOutput | Promise<ResolveFnOutput>
) => {
    try {
        return await nextResolve(specifier, context);
    } catch (error) {
        const kanReddes =
            error instanceof Error &&
            'code' in error &&
            (error.code === 'ERR_MODULE_NOT_FOUND' ||
                error.code === 'ERR_UNSUPPORTED_DIR_IMPORT') &&
            (specifier.startsWith('./') ||
                specifier.startsWith('../') ||
                specifier.startsWith('/'));

        if (!kanReddes) {
            throw error;
        }

        for (const kandidat of [`${specifier}.js`, `${specifier}/index.js`]) {
            try {
                return await nextResolve(kandidat, context);
            } catch {
                // Prøv neste kandidat
            }
        }

        throw error;
    }
};
