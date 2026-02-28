import type { FC } from 'react';

import { ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon } from '@navikt/aksel-icons';

import { Journalposttype } from '~/typer/journalføring';

type Props = {
    type: Journalposttype;
};

const DokumentIkon: FC<Props> = ({ type }) => {
    return (
        <div className="bg-ax-neutral-400A w-6.5 h-6.5 rounded-full inline-flex items-center justify-center">
            {type === Journalposttype.I && (
                <ArrowRightIcon fontSize="1.2rem" aria-label="Innkommende" />
            )}
            {type === Journalposttype.U && (
                <ArrowLeftIcon fontSize="1.2rem" aria-label="Utgående" />
            )}
            {type === Journalposttype.N && <ArrowDownIcon fontSize="1.2rem" aria-label="Notat" />}
        </div>
    );
};

export { DokumentIkon };
