import React from 'react';

import { ActionBar } from '../ActionBar/ActionBar';

type Props = {
    children?: React.ReactNode | React.ReactNode[];
    containerAriaLabel: string;
};

export const UfullstendigSakContainer: React.FC<Props> = ({ children, containerAriaLabel }) => (
    <section className="px-6 text-center" aria-label={containerAriaLabel}>
        {children}
        <ActionBar
            stegtekst="På vent"
            skjulNeste={true}
            forrigeAriaLabel={undefined}
            nesteAriaLabel="Neste"
            onNeste={() => null}
            onForrige={undefined}
        />
    </section>
);
