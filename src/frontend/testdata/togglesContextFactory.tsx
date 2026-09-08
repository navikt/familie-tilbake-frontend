import type { FC, ReactNode } from 'react';
import type { ToggleName } from '@/context/TogglesContext';

import { TogglesContext } from '@/context/TogglesContext';

type Props = {
    /** Togglene som skal være påskrudd i testen. Alle andre er avskrudd. */
    påskrudde?: ToggleName[];
    children: ReactNode;
};

/** Lar tester styre feature toggles uten å gå veien om HTTP-kallet i TogglesProvider. */
export const TestTogglesProvider: FC<Props> = ({ påskrudde = [], children }: Props) => (
    <TogglesContext
        value={{
            toggles: Object.fromEntries(påskrudde.map(navn => [navn, true])),
            feilmelding: '',
        }}
    >
        {children}
    </TogglesContext>
);
