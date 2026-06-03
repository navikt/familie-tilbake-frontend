import type { ChangeEvent } from 'react';

// biome-ignore lint/suspicious/noExplicitAny: generisk type guard for vilkårlig input
export function isChangeEvent(value: any): value is ChangeEvent<HTMLInputElement> {
    return (
        typeof value === 'object' &&
        value !== null &&
        Reflect.has(value, 'target') &&
        Reflect.has(value.target, 'value')
    );
}
