import { Alert, BodyLong, BodyShort, Button, Detail, Heading, HStack } from '@navikt/ds-react';
import React, { useEffect, useState } from 'react';
import { styled } from 'styled-components';

import { BrevmottakereAlert } from './BrevmottakereAlert';
import ForhåndsvisVedtaksbrev from './ForhåndsvisVedtaksbrev/ForhåndsvisVedtaksbrev';
import { useVedtak } from './VedtakContext';
import VedtakPerioder from './VedtakPerioder';
import VedtakSkjema from './VedtakSkjema';
import { useBehandling } from '../../../context/BehandlingContext';
import { useBehandlingState } from '../../../context/BehandlingStateContext';
import { useFagsak } from '../../../context/FagsakContext';
import { useSammenslåPerioder } from '../../../hooks/useSammenslåPerioder';
import { vedtaksresultater } from '../../../kodeverk';
import { RessursStatus } from '../../../typer/ressurs';
import { HarBrukerUttaltSegValg } from '../../../typer/tilbakekrevingstyper';
import { SYNLIGE_STEG } from '../../../utils/sider';
import DataLastIkkeSuksess from '../../Felleskomponenter/Datalast/DataLastIkkeSuksess';
import { Navigering, Spacer20 } from '../../Felleskomponenter/Flytelementer';
import { ActionBar } from '../ActionBar/ActionBar';

const StyledNavigering = styled(Navigering)`
    width: 90%;
`;

const VedtakContainer: React.FC = () => {
    const { fagsystem, eksternFagsakId } = useFagsak();
    const {
        vedtaksbrevavsnitt,
        beregningsresultat,
        skjemaData,
        nonUsedKey,
        gåTilForrige,
        senderInn,
        disableBekreft,
        sendInnSkjema,
        foreslåVedtakRespons,
        lagreUtkast,
        hentVedtaksbrevtekster,
    } = useVedtak();
    const { type, behandlingsårsakstype, kanEndres, eksternBrukId, manuelleBrevmottakere } =
        useBehandling();
    const { behandlingILesemodus, aktivtSteg, actionBarStegtekst } = useBehandlingState();
    const erLesevisning = !!behandlingILesemodus;
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
        (!erLesevisning || (kanEndres && aktivtSteg?.behandlingssteg === 'FATTE_VEDTAK')) &&
        !erRevurderingKlageKA;

    if (
        beregningsresultat?.status === RessursStatus.Suksess &&
        vedtaksbrevavsnitt?.status === RessursStatus.Suksess
    ) {
        return (
            <>
                <Heading level="1" size="small" spacing>
                    Vedtak
                </Heading>
                {erRevurderingKlageKA && (
                    <>
                        <Alert className="w-[90%] mb-3" variant="info">
                            <BodyShort className="font-semibold">
                                Vedtaksbrev sendes ikke ut fra denne behandlingen.
                            </BodyShort>
                        </Alert>
                        <Spacer20 />
                    </>
                )}

                {manuelleBrevmottakere.length > 0 && (
                    <>
                        <BrevmottakereAlert
                            brevmottakere={manuelleBrevmottakere.map(
                                ({ brevmottaker }) => brevmottaker
                            )}
                            linkTilBrevmottakerSteg={`/fagsystem/${fagsystem}/fagsak/${eksternFagsakId}/behandling/${eksternBrukId}/${SYNLIGE_STEG.BREVMOTTAKER.href}`}
                        />
                        <Spacer20 />
                    </>
                )}
                <Detail weight="semibold">Resultat</Detail>
                <BodyLong size="small" spacing>
                    {vedtaksresultater[beregningsresultat.data.vedtaksresultat]}
                </BodyLong>
                <VedtakPerioder perioder={beregningsresultat.data.beregningsresultatsperioder} />
                <Spacer20 />
                {!!skjemaData.length && (
                    <VedtakSkjema
                        avsnitter={skjemaData}
                        erLesevisning={erLesevisning}
                        erRevurderingBortfaltBeløp={erRevurderingBortfaltBeløp}
                        harBrukerUttaltSeg={
                            beregningsresultat.data.vurderingAvBrukersUttalelse
                                .harBrukerUttaltSeg === HarBrukerUttaltSegValg.Ja
                        }
                    />
                )}
                <Spacer20 />
                {foreslåVedtakRespons &&
                    (foreslåVedtakRespons.status === RessursStatus.Feilet ||
                        foreslåVedtakRespons.status === RessursStatus.FunksjonellFeil) && (
                        <Alert className="w-[90%] mb-3" variant="error">
                            {foreslåVedtakRespons.frontendFeilmelding}
                        </Alert>
                    )}
                <StyledNavigering>
                    <HStack gap="space-4">
                        {kanViseForhåndsvisning && !!skjemaData.length && (
                            <ForhåndsvisVedtaksbrev />
                        )}
                        {!erLesevisning && !erRevurderingKlageKA && !!skjemaData.length && (
                            <Button
                                variant="tertiary"
                                onClick={lagreUtkast}
                                loading={senderInn}
                                disabled={senderInn}
                            >
                                Lagre utkast
                            </Button>
                        )}
                        {!erLesevisning && erPerioderLike && (
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

                        {feilmelding && <Alert variant="error">{feilmelding}</Alert>}
                    </HStack>
                </StyledNavigering>

                <ActionBar
                    disableNeste={senderInn || disableBekreft || harValideringsFeil}
                    skjulNeste={erLesevisning}
                    stegtekst={actionBarStegtekst('FORESLÅ_VEDTAK')}
                    nesteTekst="Send til godkjenning"
                    forrigeAriaLabel="Gå tilbake til vilkårsvurderingssteget"
                    nesteAriaLabel="Send til godkjenning hos beslutter"
                    onNeste={sendInnSkjema}
                    onForrige={gåTilForrige}
                    isLoading={senderInn}
                />
            </>
        );
    } else {
        return <DataLastIkkeSuksess ressurser={[beregningsresultat, vedtaksbrevavsnitt]} />;
    }
};

export default VedtakContainer;
