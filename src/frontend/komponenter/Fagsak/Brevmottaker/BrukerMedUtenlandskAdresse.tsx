import React from 'react';

import ManuellRegistrering from './ManuellRegistrering';
import { useFagsak } from '../../../context/FagsakContext';
import { MottakerType } from '../../../typer/Brevmottaker';

export const BrukerMedUtenlandskAdresse: React.FC = () => {
    const { fagsak } = useFagsak();

    const brukerNavn =
        fagsak?.status === 'SUKSESS' && fagsak.data?.bruker?.navn ? fagsak.data.bruker.navn : '';

    return (
        <ManuellRegistrering
            prefix="brukerMedUtenlandskAdresse"
            preutfyltNavn={brukerNavn}
            mottakerType={MottakerType.BrukerMedUtenlandskAdresse}
        />
    );
};
