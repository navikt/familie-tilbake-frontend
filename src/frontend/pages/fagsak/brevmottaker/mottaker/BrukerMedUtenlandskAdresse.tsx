import React from 'react';

import { useFagsak } from '../../../../context/FagsakContext';
import { MottakerType } from '../../../../typer/Brevmottaker';
import { ManuellRegistrering } from '../adressekilde/ManuellRegistrering';

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
