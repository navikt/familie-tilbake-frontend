import type { FC } from 'react';
import type { ForhaandsvarselErSendt, Uttalelse } from '~/generated-new';

export type SendtVarselProps = ForhaandsvarselErSendt & {
    brukeruttalelse: Uttalelse | null;
};

export const SendtVarsel: FC<SendtVarselProps> = () => {
    return null;
};
