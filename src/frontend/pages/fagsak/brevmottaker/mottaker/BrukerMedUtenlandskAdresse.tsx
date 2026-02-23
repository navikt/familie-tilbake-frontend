import React from 'react';

import { useFagsak } from '~/context/FagsakContext';
import { ManuellRegistrering } from '~/pages/fagsak/brevmottaker/adressekilde/ManuellRegistrering';
import { MottakerType } from '~/typer/Brevmottaker';

export const BrukerMedUtenlandskAdresse: React.FC = () => {
    const { bruker } = useFagsak();

    return (
        <ManuellRegistrering
            prefix="brukerMedUtenlandskAdresse"
            preutfyltNavn={bruker.navn}
            mottakerType={MottakerType.BrukerMedUtenlandskAdresse}
        />
    );
};
