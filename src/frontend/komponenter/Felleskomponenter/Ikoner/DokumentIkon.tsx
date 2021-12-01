import * as React from 'react';

import { DownFilled, LeftFilled, RightFilled } from '@navikt/ds-icons';
import { Journalposttype } from '@navikt/familie-typer';

import { TidslinjeIkonbakgrunn } from './ikonelementer';

interface IProps {
    type: Journalposttype;
}

const DokumentIkon: React.FC<IProps> = ({ type }) => {
    return (
        <TidslinjeIkonbakgrunn>
            {type === Journalposttype.I && <RightFilled fontSize="18" aria-label="Innkommende" />}
            {type === Journalposttype.U && <LeftFilled fontSize="18" aria-label="Utgående" />}
            {type === Journalposttype.N && <DownFilled fontSize="18" aria-label="Notat" />}
        </TidslinjeIkonbakgrunn>
    );
};

export { DokumentIkon };
