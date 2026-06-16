// Registrerer en custom ESM-resolve-hook som håndterer mappe- og extensionless-importer
// i den kompilerte koden. Dette erstatter ts-node/esm, som både trigget
// ExperimentalWarning for '--experimental-loader' og DEP0180 (fs.Stats deprecation).

import { register } from 'node:module';

register('./esm-resolve-hooks.js', import.meta.url);
