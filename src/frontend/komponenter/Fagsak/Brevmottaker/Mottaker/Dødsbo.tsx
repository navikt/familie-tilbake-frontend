import React from 'react';

import { useFagsak } from '../../../../context/FagsakContext';
import { MottakerType } from '../../../../typer/Brevmottaker';
import { ManuellRegistrering } from '../Adressekilde/ManuellRegistrering';

export const Dødsbo: React.FC = () => {
    const { fagsak } = useFagsak();

    const dødsboNavn =
        fagsak?.status === 'SUKSESS' && fagsak.data?.bruker?.navn
            ? `${fagsak.data.bruker.navn} v/dødsbo`
            : '';

    return (
        <ManuellRegistrering
            prefix="dødsbo"
            preutfyltNavn={dødsboNavn}
            mottakerType={MottakerType.Dødsbo}
        />
    );
};
