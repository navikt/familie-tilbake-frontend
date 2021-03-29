import styled from 'styled-components';

import { Normaltekst } from 'nav-frontend-typografi';

export const formatCurrencyNoKr = (value?: string | number): string | undefined => {
    if (value === null || value === undefined) {
        return undefined;
    }
    // Fjerner mellomrom i tilfelle vi får inn tall med det
    const newVal = value.toString().replace(/\s/g, '');
    if (Number.isNaN(newVal)) {
        return undefined;
    }
    return Number(Math.round(parseFloat(newVal)))
        .toLocaleString('nb-NO')
        .replace(/,|\s/g, ' ');
};

export const isNumeric = (val: string): boolean => {
    return !isNaN(Number(val));
};

export const NormaltekstBold = styled(Normaltekst)`
    font-weight: 600;
`;
