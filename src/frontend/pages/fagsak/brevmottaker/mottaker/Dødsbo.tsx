import { useFagsak } from '@context/FagsakContext';
import { ManuellRegistrering } from '@pages/fagsak/brevmottaker/adressekilde/ManuellRegistrering';
import { MottakerType } from '@typer/Brevmottaker';
import React from 'react';

export const Dødsbo: React.FC = () => {
    const { bruker } = useFagsak();

    const dødsboNavn = `${bruker.navn} v/dødsbo`;

    return (
        <ManuellRegistrering
            prefix="dødsbo"
            preutfyltNavn={dødsboNavn}
            mottakerType={MottakerType.Dødsbo}
        />
    );
};
