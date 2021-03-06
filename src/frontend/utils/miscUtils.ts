export const parseStringToNumber = (text: string): number => {
    return Number(Math.round(parseFloat(text)));
};

export const formatCurrencyNoKr = (value?: string | number): string | undefined => {
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
