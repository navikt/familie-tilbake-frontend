import type { FC } from 'react';

import { Heading, VStack } from '@navikt/ds-react';

import { useBehandling } from '@/context/BehandlingContext';
import { useBehandlingState } from '@/context/BehandlingStateContext';
import { useActionBar } from '@/hooks/useActionBar';
import { DataLastIkkeSuksess } from '@/komponenter/datalast/DataLastIkkeSuksess';
import { Steginformasjon } from '@/komponenter/steginformasjon/StegInformasjon';
import { RessursStatus } from '@/typer/ressurs';

import { useFakta } from './FaktaContext';
import { GammelFaktaSkjema } from './GammelFaktaSkjema';

export const FaktaContainer: FC = () => {
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

    const forrigeAriaLabel = behandling.harVerge
        ? 'Gå tilbake til vergesteget'
        : harBrevmottakerSteg
          ? 'Gå tilbake til brevmottakersteget'
          : undefined;
    const onForrige = behandling.harVerge || harBrevmottakerSteg ? navigerTilForrige : undefined;

    const fellesActionBarConfig = {
        stegtekst: actionBarStegtekst('FAKTA'),
        forrigeAriaLabel: forrigeAriaLabel,
        onForrige: onForrige,
        isLoading: senderInn,
    };

    useActionBar(
        harFeil
            ? {
                  ...fellesActionBarConfig,
                  skjulNeste: true,
              }
            : {
                  ...fellesActionBarConfig,
                  onNeste: sendInnSkjema,
                  nesteAriaLabel: harForhåndsvarselSteg
                      ? 'Gå videre til forhåndsvarselsteget'
                      : 'Gå videre til foreldelsessteget',
              }
    );

    return (
        <>
            {fakta?.status === RessursStatus.Suksess ? (
                <VStack gap="space-24">
                    <Heading size="medium">Fakta fra feilutbetalingssaken</Heading>
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
        </>
    );
};
