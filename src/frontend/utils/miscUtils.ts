export const parseStringToNumber = (text: string): number => {
    return Number(Math.round(parseFloat(text)));
};

export const formatCurrencyNoKr = (value?: number | string): string | undefined => {
    if (value === null || value === undefined) {
        return undefined;
    }
    // Fjerner mellomrom i tilfelle vi får inn tall med det
    const newVal = value.toString().replace(/\s/g, '');
    if (Number.isNaN(newVal)) {
        return undefined;
    }
    return parseStringToNumber(newVal).toLocaleString('nb-NO').replace(/,|\s/g, ' ');
};

export const isNumeric = (val: string): boolean => {
    return !isNaN(Number(val));
};

export const base64ToArrayBuffer = (base64: string): Uint8Array<ArrayBuffer> => {
    const binaryString = window.atob(base64);
    const binaryLen = binaryString.length;
    const bytes = new Uint8Array(binaryLen);
    for (let i = 0; i < binaryLen; i++) {
        const ascii = binaryString.charCodeAt(i);
        bytes[i] = ascii;
    }
    return bytes;
};
