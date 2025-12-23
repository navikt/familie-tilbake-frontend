import React from 'react';

import { useFagsak } from '../../../../context/FagsakContext';
import { MottakerType } from '../../../../typer/Brevmottaker';
import { ManuellRegistrering } from '../Adressekilde/ManuellRegistrering';

export const BrukerMedUtenlandskAdresse: React.FC = () => {
    const { fagsak } = useFagsak();

    const brukerNavn = fagsak?.bruker?.navn ? fagsak.bruker.navn : '';

    return (
        <ManuellRegistrering
            prefix="brukerMedUtenlandskAdresse"
            preutfyltNavn={brukerNavn}
            mottakerType={MottakerType.BrukerMedUtenlandskAdresse}
        />
    );
};
