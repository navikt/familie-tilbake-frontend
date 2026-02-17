import { ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon } from '@navikt/aksel-icons';
import * as React from 'react';

import { Journalposttype } from '../../typer/journalføring';

type Props = {
    type: Journalposttype;
};

const DokumentIkon: React.FC<Props> = ({ type }) => {
    return (
        <div className="bg-ax-neutral-400A w-[26px] h-[26px] rounded-full inline-flex items-center justify-center">
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
