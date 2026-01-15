import { Alert, BodyLong, BodyShort, Button, Detail, Heading, HStack } from '@navikt/ds-react';
import { AFontWeightBold, ASpacing3 } from '@navikt/ds-tokens/dist/tokens';
import React, { useEffect, useState } from 'react';
import { styled } from 'styled-components';

import { BrevmottakereAlert } from './BrevmottakereAlert';
import ForhåndsvisVedtaksbrev from './ForhåndsvisVedtaksbrev/ForhåndsvisVedtaksbrev';
import { useVedtak } from './VedtakContext';
import VedtakPerioder from './VedtakPerioder';
import VedtakSkjema from './VedtakSkjema';
import { useBehandling } from '../../../context/BehandlingContext';
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

const StyledAlert = styled(Alert)`
    width: 90%;
    margin-bottom: ${ASpacing3};
`;

const VarselbrevInfo = styled(BodyShort)`
    font-weight: ${AFontWeightBold};
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
    const { behandling, behandlingILesemodus, aktivtSteg, actionBarStegtekst } = useBehandling();
    const erLesevisning = !!behandlingILesemodus;
    const erRevurderingKlageKA = behandling.behandlingsårsakstype === 'REVURDERING_KLAGE_KA';
    const erRevurderingBortfaltBeløp =
        behandling.type === 'REVURDERING_TILBAKEKREVING' &&
        behandling.behandlingsårsakstype ===
            'REVURDERING_FEILUTBETALT_BELØP_HELT_ELLER_DELVIS_BORTFALT';
    const [erPerioderSammenslått, settErPerioderSammenslått] = useState<boolean>(false);

    const {
        sammenslåPerioder,
        angreSammenslåingAvPerioder,
        hentErPerioderSammenslått,
        hentErPerioderLike,
        erPerioderLike,
        laster,
        feilmelding,
    } = useSammenslåPerioder(behandling.behandlingId);

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

    if (!behandling) return null;

    const harValideringsFeil = skjemaData.some(avs =>
        avs.underavsnittsliste.some(uavs => uavs.harFeil)
    );

    const kanViseForhåndsvisning =
        (!erLesevisning ||
            (behandling.kanEndres && aktivtSteg?.behandlingssteg === 'FATTE_VEDTAK')) &&
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
                        <StyledAlert variant="info">
                            <VarselbrevInfo>
                                Vedtaksbrev sendes ikke ut fra denne behandlingen.
                            </VarselbrevInfo>
                        </StyledAlert>
                        <Spacer20 />
                    </>
                )}

                {behandling.manuelleBrevmottakere.length > 0 && (
                    <>
                        <BrevmottakereAlert
                            brevmottakere={behandling.manuelleBrevmottakere.map(
                                brevmottakerDto => brevmottakerDto.brevmottaker
                            )}
                            linkTilBrevmottakerSteg={`/fagsystem/${fagsystem}/fagsak/${eksternFagsakId}/behandling/${behandling.eksternBrukId}/${SYNLIGE_STEG.BREVMOTTAKER.href}`}
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
                        <StyledAlert variant="error">
                            {foreslåVedtakRespons.frontendFeilmelding}
                        </StyledAlert>
                    )}
                <StyledNavigering>
                    <HStack gap="1">
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
