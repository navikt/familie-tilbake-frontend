import React from 'react';

import { useFagsak } from '../../../../context/FagsakContext';
import { MottakerType } from '../../../../typer/Brevmottaker';
import { ManuellRegistrering } from '../adressekilde-edit/ManuellRegistrering';

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
