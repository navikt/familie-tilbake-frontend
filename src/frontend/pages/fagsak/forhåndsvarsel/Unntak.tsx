import type { FC } from 'react';
import type { ForhaandsvarselUnntak, Uttalelse } from '~/generated-new';

export type UnntakProps = ForhaandsvarselUnntak & {
    brukeruttalelse: Uttalelse | null;
};

export const Unntak: FC<UnntakProps> = () => {
    return null;
};
