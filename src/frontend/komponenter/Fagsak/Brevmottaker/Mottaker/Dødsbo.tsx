import React from 'react';

import { useFagsak } from '../../../../context/FagsakContext';
import { MottakerType } from '../../../../typer/Brevmottaker';
import { ManuellRegistrering } from '../Adressekilde/ManuellRegistrering';

export const Dødsbo: React.FC = () => {
    const { fagsak } = useFagsak();

    const dødsboNavn = fagsak.bruker?.navn ? `${fagsak.bruker.navn} v/dødsbo` : '';

    return (
        <ManuellRegistrering
            prefix="dødsbo"
            preutfyltNavn={dødsboNavn}
            mottakerType={MottakerType.Dødsbo}
        />
    );
};
