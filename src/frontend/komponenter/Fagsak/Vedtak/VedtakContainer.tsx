import type { IBehandling } from '../../../typer/behandling';
import type { IFagsak } from '../../../typer/fagsak';

import { Alert, BodyLong, BodyShort, Button, Detail, Heading, HStack } from '@navikt/ds-react';
import { AFontWeightBold, ASpacing3 } from '@navikt/ds-tokens/dist/tokens';
import React, { useEffect, useState } from 'react';
import { styled } from 'styled-components';

import { BrevmottakereAlert } from './BrevmottakereAlert';
import { useFeilutbetalingVedtak } from './FeilutbetalingVedtakContext';
import ForhåndsvisVedtaksbrev from './ForhåndsvisVedtaksbrev/ForhåndsvisVedtaksbrev';
import VedtakPerioder from './VedtakPerioder';
import VedtakSkjema from './VedtakSkjema';
import { useBehandling } from '../../../context/BehandlingContext';
import { useSammenslåPerioder } from '../../../hooks/useSammenslåPerioder';
import { vedtaksresultater } from '../../../kodeverk';
import { Behandlingssteg, Behandlingstype, Behandlingårsak } from '../../../typer/behandling';
import { HarBrukerUttaltSegValg } from '../../../typer/feilutbetalingtyper';
import { RessursStatus } from '../../../typer/ressurs';
import DataLastIkkeSuksess from '../../Felleskomponenter/Datalast/DataLastIkkeSuksess';
import { Navigering, Spacer20 } from '../../Felleskomponenter/Flytelementer';
import { sider } from '../../Felleskomponenter/Venstremeny/sider';

const StyledVedtak = styled.div`
    padding: ${ASpacing3};
`;

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

interface IProps {
    behandling: IBehandling;
    fagsak: IFagsak;
}

const VedtakContainer: React.FC<IProps> = ({ behandling, fagsak }) => {
    const {
        feilutbetalingVedtaksbrevavsnitt,
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
    } = useFeilutbetalingVedtak();
    const { behandlingILesemodus, aktivtSteg } = useBehandling();
    const erLesevisning = !!behandlingILesemodus;
    const erRevurderingKlageKA =
        behandling.behandlingsårsakstype === Behandlingårsak.RevurderingKlageKa;
    const erRevurderingBortfaltBeløp =
        behandling.type === Behandlingstype.RevurderingTilbakekreving &&
        behandling.behandlingsårsakstype ===
            Behandlingårsak.RevurderingFeilutbetaltBeløpHeltEllerDelvisBortfalt;
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

    const handleKnappTrykk = async () => {
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
        const fetch = async () => {
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
            (behandling.kanEndres &&
                aktivtSteg?.behandlingssteg === Behandlingssteg.FatteVedtak)) &&
        !erRevurderingKlageKA;

    if (
        beregningsresultat?.status === RessursStatus.Suksess &&
        feilutbetalingVedtaksbrevavsnitt?.status === RessursStatus.Suksess
    ) {
        return (
            <StyledVedtak>
                <Heading level="2" size="small" spacing>
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
                            institusjon={fagsak?.institusjon}
                            bruker={fagsak.bruker}
                            linkTilBrevmottakerSteg={`/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}/${sider.BREVMOTTAKER.href}`}
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
                <VedtakSkjema
                    avsnitter={skjemaData}
                    erLesevisning={erLesevisning}
                    erRevurderingBortfaltBeløp={erRevurderingBortfaltBeløp}
                    harBrukerUttaltSeg={
                        beregningsresultat.data.vurderingAvBrukersUttalelse.harBrukerUttaltSeg ===
                        HarBrukerUttaltSegValg.Ja
                    }
                />
                <Spacer20 />
                {foreslåVedtakRespons &&
                    (foreslåVedtakRespons.status === RessursStatus.Feilet ||
                        foreslåVedtakRespons.status === RessursStatus.FunksjonellFeil) && (
                        <StyledAlert variant="error">
                            {foreslåVedtakRespons.frontendFeilmelding}
                        </StyledAlert>
                    )}
                <StyledNavigering>
                    {!erLesevisning && (
                        <Button
                            variant="primary"
                            onClick={sendInnSkjema}
                            loading={senderInn}
                            disabled={senderInn || disableBekreft || harValideringsFeil}
                        >
                            Til godkjenning
                        </Button>
                    )}
                    <HStack gap="1">
                        {kanViseForhåndsvisning && <ForhåndsvisVedtaksbrev />}
                        {!erLesevisning && !erRevurderingKlageKA && (
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
                    <Button variant="secondary" onClick={gåTilForrige}>
                        Forrige
                    </Button>
                </StyledNavigering>
            </StyledVedtak>
        );
    } else {
        return (
            <DataLastIkkeSuksess
                ressurser={[beregningsresultat, feilutbetalingVedtaksbrevavsnitt]}
            />
        );
    }
};

export default VedtakContainer;
