import { ChangeEvent } from 'react';
import Hashids from 'hashids';
const hashid = new Hashids();

// eslint-disable-next-line
export function isChangeEvent(value: any): value is ChangeEvent<HTMLInputElement> {
    return (
        typeof value === 'object' &&
        value !== null &&
        Reflect.has(value, 'target') &&
        Reflect.has(value.target, 'value')
    );
}

function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString()
        .substring(1);
}

export function genererId() {
    return hashid.encode([s4(), s4()]);
}
