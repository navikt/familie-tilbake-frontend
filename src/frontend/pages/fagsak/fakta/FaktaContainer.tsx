import { useBehandling } from '@context/BehandlingContext';
import { useBehandlingState } from '@context/BehandlingStateContext';
import { ActionBar } from '@komponenter/action-bar/ActionBar';
import { DataLastIkkeSuksess } from '@komponenter/datalast/DataLastIkkeSuksess';
import { Steginformasjon } from '@komponenter/steginformasjon/StegInformasjon';
import { Heading, VStack } from '@navikt/ds-react';
import { RessursStatus } from '@typer/ressurs';
import * as React from 'react';

import { useFakta } from './FaktaContext';
import { GammelFaktaSkjema } from './GammelFaktaSkjema';

export const FaktaContainer: React.FC = () => {
    const { stegErBehandlet, skjemaData, fakta, navigerTilForrige, sendInnSkjema, senderInn } =
        useFakta();
    const { behandlingILesemodus, actionBarStegtekst } = useBehandlingState();
    const behandling = useBehandling();

    const harBrevmottakerSteg = behandling.behandlingsstegsinfo.some(
        steg =>
            steg.behandlingssteg === 'BREVMOTTAKER' && steg.behandlingsstegstatus !== 'TILBAKEFØRT'
    );

    const harForhåndsvarselSteg = behandling.behandlingsstegsinfo.some(
        steg => steg.behandlingssteg === 'FORHÅNDSVARSEL'
    );

    const harFeil = fakta?.status !== RessursStatus.Suksess;

    return (
        <>
            {fakta?.status === RessursStatus.Suksess ? (
                <VStack gap="space-24">
                    <Heading size="small">Fakta fra feilutbetalingssaken</Heading>
                    {(!behandlingILesemodus || stegErBehandlet) && (
                        <Steginformasjon
                            behandletSteg={stegErBehandlet}
                            infotekst="Kontroller at korrekt hendelse er satt"
                        />
                    )}
                    <GammelFaktaSkjema skjemaData={skjemaData} fakta={fakta.data} />
                </VStack>
            ) : (
                <DataLastIkkeSuksess ressurser={[fakta]} />
            )}
            <ActionBar
                stegtekst={actionBarStegtekst('FAKTA')}
                forrigeAriaLabel={
                    behandling.harVerge
                        ? 'Gå tilbake til vergesteget'
                        : harBrevmottakerSteg
                          ? 'Gå tilbake til brevmottakersteget'
                          : undefined
                }
                nesteAriaLabel={
                    harForhåndsvarselSteg
                        ? 'Gå videre til forhåndsvarselsteget'
                        : 'Gå videre til foreldelsessteget'
                }
                onForrige={
                    behandling.harVerge || harBrevmottakerSteg ? navigerTilForrige : undefined
                }
                onNeste={sendInnSkjema}
                isLoading={senderInn}
                skjulNeste={harFeil}
            />
        </>
    );
};
