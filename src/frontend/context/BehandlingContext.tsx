import React from 'react';

import createUseContext from 'constate';

import {
    BehandlingResultat,
    BehandlingStatus,
    BehandlingÅrsak,
    IBehandling,
} from '../typer/behandling';
import { useFagsakRessurser, brukerMock } from './FagsakContext';

const behandlingMock = {
    aktiv: true,
    årsak: BehandlingÅrsak.NYE_OPPLYSNINGER,
    resultat: BehandlingResultat.IKKE_VURDERT,
    status: BehandlingStatus.UTREDES,
};

const [BehandlingProvider, useBehandling] = createUseContext(() => {
    const [åpenBehandling, settÅpenBehandling] = React.useState<IBehandling>();
    const { settPerson, settSak } = useFagsakRessurser();

    const hentBehandlingContext = (
        ytelseType: string,
        fagsakId: string,
        behandlingId: string
    ): void => {
        const personIdent = '12345610001';
        settSak({
            id: fagsakId,
            fagsakId: fagsakId,
            ytelseType,
            søkerFødselsnummer: personIdent,
        });
        settPerson({ personIdent, ...brukerMock });
        settÅpenBehandling({ behandlingId, ...behandlingMock });
    };

    const hentBehandling = (_fagsakId: string, behandlingId: string): void => {
        settÅpenBehandling({ behandlingId, ...behandlingMock });
    };

    return {
        åpenBehandling,
        hentBehandling,
        hentBehandlingContext,
    };
});

export { BehandlingProvider, useBehandling };
