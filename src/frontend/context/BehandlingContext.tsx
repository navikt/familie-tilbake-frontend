import React from 'react';

import createUseContext from 'constate';

import {
    BehandlingResultat,
    BehandlingStatus,
    BehandlingÅrsak,
    IBehandling,
} from '../typer/behandling';

const behandlingMock = {
    aktiv: true,
    årsak: BehandlingÅrsak.NYE_OPPLYSNINGER,
    resultat: BehandlingResultat.IKKE_VURDERT,
    status: BehandlingStatus.UTREDES,
};

const [BehandlingProvider, useBehandling] = createUseContext(() => {
    const [åpenBehandling, settÅpenBehandling] = React.useState<IBehandling>();

    const hentBehandling = (_fagsakId: string, behandlingId: string): void => {
        settÅpenBehandling({ behandlingId, ...behandlingMock });
    };

    return {
        åpenBehandling,
        hentBehandling,
    };
});

export { BehandlingProvider, useBehandling };
