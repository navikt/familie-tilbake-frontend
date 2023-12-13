import * as React from 'react';

import { ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon } from '@navikt/aksel-icons';
import { Journalposttype } from '@navikt/familie-typer';

import { TidslinjeIkonbakgrunn } from './ikonelementer';

interface IProps {
    type: Journalposttype;
}

const DokumentIkon: React.FC<IProps> = ({ type }) => {
    return (
        <TidslinjeIkonbakgrunn>
            {type === Journalposttype.I && (
                <ArrowRightIcon fontSize={'1.2rem'} aria-label="Innkommende" />
            )}
            {type === Journalposttype.U && (
                <ArrowLeftIcon fontSize={'1.2rem'} aria-label="Utgående" />
            )}
            {type === Journalposttype.N && <ArrowDownIcon fontSize={'1.2rem'} aria-label="Notat" />}
        </TidslinjeIkonbakgrunn>
    );
};

export { DokumentIkon };
