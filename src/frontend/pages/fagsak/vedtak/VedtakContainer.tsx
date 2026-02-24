import {
    BodyLong,
    BodyShort,
    Button,
    Detail,
    Heading,
    HStack,
    LocalAlert,
    VStack,
} from '@navikt/ds-react';
import React, { useEffect, useState } from 'react';

import { useBehandling } from '~/context/BehandlingContext';
import { useBehandlingState } from '~/context/BehandlingStateContext';
import { useSammenslåPerioder } from '~/hooks/useSammenslåPerioder';
import { vedtaksresultater } from '~/kodeverk';
import { ActionBar } from '~/komponenter/action-bar/ActionBar';
import { DataLastIkkeSuksess } from '~/komponenter/datalast/DataLastIkkeSuksess';
import { BekreftelsesModal } from '~/komponenter/modal/bekreftelse/BekreftelsesModal';
import { RessursStatus } from '~/typer/ressurs';
import { HarBrukerUttaltSegValg } from '~/typer/tilbakekrevingstyper';

import { BrevmottakereAlert } from './BrevmottakereAlert';
import { ForhåndsvisVedtaksbrev } from './forhåndsvis-vedtaksbrev/ForhåndsvisVedtaksbrev';
import { useVedtak } from './VedtakContext';
import { VedtakPerioder } from './VedtakPerioder';
import { VedtakSkjema } from './VedtakSkjema';

export const VedtakContainer: React.FC = () => {
    const {
        vedtaksbrevavsnitt,
        beregningsresultat,
        skjemaData,
        nonUsedKey,
        navigerTilForrige,
        senderInn,
        disableBekreft,
        sendInnSkjema,
        foreslåVedtakRespons,
        lagreUtkast,
        hentVedtaksbrevtekster,
    } = useVedtak();
    const { type, behandlingsårsakstype, kanEndres, manuelleBrevmottakere, erNyModell } =
        useBehandling();
    const { behandlingILesemodus, aktivtSteg, actionBarStegtekst } = useBehandlingState();
    const [visBekreftelsesmodal, settVisBekreftelsesmodal] = useState(false);

    const erRevurderingKlageKA = behandlingsårsakstype === 'REVURDERING_KLAGE_KA';
    const erRevurderingBortfaltBeløp =
        type === 'REVURDERING_TILBAKEKREVING' &&
        behandlingsårsakstype === 'REVURDERING_FEILUTBETALT_BELØP_HELT_ELLER_DELVIS_BORTFALT';
    const [erPerioderSammenslått, settErPerioderSammenslått] = useState<boolean>(false);

    const {
        sammenslåPerioder,
        angreSammenslåingAvPerioder,
        hentErPerioderSammenslått,
        hentErPerioderLike,
        erPerioderLike,
        laster,
        feilmelding,
    } = useSammenslåPerioder();

    const handleKnappTrykk = async (): Promise<void> => {
        const oppdaterErPerioderSammenslått = !erPerioderSammenslått;
        settErPerioderSammenslått(oppdaterErPerioderSammenslått);
        if (!oppdaterErPerioderSammenslått) {
            await angreSammenslåingAvPerioder();
        } else {
            await sammenslåPerioder();
        }
        hentVedtaksbrevtekster();
    };

    useEffect(() => {
        const fetch = async (): Promise<void> => {
            await hentErPerioderLike();

            const sammenslåttResponse = await hentErPerioderSammenslått();
            settErPerioderSammenslått(!!sammenslåttResponse);
        };
        fetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // Skal trigge re-rendring
    }, [nonUsedKey]);

    const harValideringsFeil = skjemaData.some(avs =>
        avs.underavsnittsliste.some(uavs => uavs.harFeil)
    );

    const kanViseForhåndsvisning =
        (!behandlingILesemodus || (kanEndres && aktivtSteg?.behandlingssteg === 'FATTE_VEDTAK')) &&
        !erRevurderingKlageKA;

    if (
        beregningsresultat?.status === RessursStatus.Suksess &&
        vedtaksbrevavsnitt?.status === RessursStatus.Suksess
    ) {
        return (
            <VStack gap="space-24">
                <Heading size="small">Vedtak</Heading>
                {erRevurderingKlageKA && (
                    <LocalAlert status="announcement">
                        <LocalAlert.Content>
                            <BodyShort className="font-semibold">
                                Vedtaksbrev sendes ikke ut fra denne behandlingen.
                            </BodyShort>
                        </LocalAlert.Content>
                    </LocalAlert>
                )}

                {manuelleBrevmottakere.length > 0 && (
                    <BrevmottakereAlert
                        brevmottakere={manuelleBrevmottakere.map(
                            ({ brevmottaker }) => brevmottaker
                        )}
                    />
                )}
                <HStack gap="space-4" align="center">
                    <Detail weight="semibold">Resultat</Detail>
                    <BodyLong size="small">
                        {vedtaksresultater[beregningsresultat.data.vedtaksresultat]}
                    </BodyLong>
                </HStack>

                <VedtakPerioder perioder={beregningsresultat.data.beregningsresultatsperioder} />

                {!!skjemaData.length && (
                    <VedtakSkjema
                        avsnitter={skjemaData}
                        erRevurderingBortfaltBeløp={erRevurderingBortfaltBeløp}
                        harBrukerUttaltSeg={
                            beregningsresultat.data.vurderingAvBrukersUttalelse
                                .harBrukerUttaltSeg === HarBrukerUttaltSegValg.Ja
                        }
                    />
                )}

                {foreslåVedtakRespons &&
                    (foreslåVedtakRespons.status === RessursStatus.Feilet ||
                        foreslåVedtakRespons.status === RessursStatus.FunksjonellFeil) && (
                        <LocalAlert status="error">
                            <LocalAlert.Content>
                                {foreslåVedtakRespons.frontendFeilmelding}
                            </LocalAlert.Content>
                        </LocalAlert>
                    )}

                <div className="flex flex-row-reverse">
                    <HStack gap="space-4">
                        {kanViseForhåndsvisning && !!skjemaData.length && (
                            <ForhåndsvisVedtaksbrev />
                        )}
                        {!behandlingILesemodus && !erRevurderingKlageKA && !!skjemaData.length && (
                            <Button
                                variant="tertiary"
                                onClick={lagreUtkast}
                                loading={senderInn}
                                disabled={senderInn}
                            >
                                Lagre utkast
                            </Button>
                        )}
                        {!behandlingILesemodus && erPerioderLike && (
                            <Button
                                variant="tertiary"
                                onClick={handleKnappTrykk}
                                loading={laster}
                                disabled={laster}
                            >
                                {erPerioderSammenslått
                                    ? 'Angre sammenslåing'
                                    : 'Sammenslå perioder'}
                            </Button>
                        )}

                        {feilmelding && (
                            <LocalAlert status="error">
                                <LocalAlert.Content>{feilmelding}</LocalAlert.Content>
                            </LocalAlert>
                        )}
                    </HStack>
                </div>
                <ActionBar
                    disableNeste={senderInn || disableBekreft || harValideringsFeil}
                    skjulNeste={behandlingILesemodus}
                    stegtekst={actionBarStegtekst('FORESLÅ_VEDTAK')}
                    nesteTekst="Send til godkjenning"
                    forrigeAriaLabel="Gå tilbake til vilkårsvurderingssteget"
                    nesteAriaLabel="Send til godkjenning hos beslutter"
                    onNeste={() => settVisBekreftelsesmodal(true)}
                    onForrige={navigerTilForrige}
                    isLoading={senderInn}
                />
                <BekreftelsesModal
                    åpen={visBekreftelsesmodal}
                    onLukk={() => settVisBekreftelsesmodal(false)}
                    overskrift="Send til godkjenning"
                    brødtekst={erNyModell ? 'Denne handlingen kan ikke angres.' : undefined}
                    bekreftTekst="Send til godkjenning"
                    onBekreft={() => sendInnSkjema(() => settVisBekreftelsesmodal(false))}
                    laster={senderInn}
                />
            </VStack>
        );
    } else {
        return <DataLastIkkeSuksess ressurser={[beregningsresultat, vedtaksbrevavsnitt]} />;
    }
};
