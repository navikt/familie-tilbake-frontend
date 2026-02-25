import { useSuspenseQuery } from '@tanstack/react-query';
import * as React from 'react';

import { useBehandling } from '~/context/BehandlingContext';
import { useBehandlingState } from '~/context/BehandlingStateContext';
import { behandlingHentVedtaksbrevOptions } from '~/generated-new/@tanstack/react-query.gen';
import { ActionBar } from '~/komponenter/action-bar/ActionBar';
import { useStegNavigering } from '~/utils/sider';

import { Vedtaksbrev } from './Vedtaksbrev';

export const Vedtak: React.FC = () => {
    const { behandlingId } = useBehandling();
    const { actionBarStegtekst } = useBehandlingState();
    const navigerTilForrige = useStegNavigering('VILKÅRSVURDERING');
    const { data: vedtaksbrevData } = useSuspenseQuery(
        behandlingHentVedtaksbrevOptions({ path: { behandlingId } })
    );

    return (
        <>
            {/* <Heading size="medium">Vedtak</Heading> */}

            {/* <Vedtakstabell /> */}

            <Vedtaksbrev vedtaksbrevData={vedtaksbrevData} />

            <ActionBar
                stegtekst={actionBarStegtekst('FORESLÅ_VEDTAK')}
                nesteTekst="Send til godkjenning"
                forrigeAriaLabel="Gå tilbake til vilkårsvurderingssteget"
                nesteAriaLabel="Send til godkjenning hos beslutter"
                onNeste={() => {
                    // TODO: Implementer send til godkjenning
                }}
                onForrige={navigerTilForrige}
            />
        </>
    );
};
