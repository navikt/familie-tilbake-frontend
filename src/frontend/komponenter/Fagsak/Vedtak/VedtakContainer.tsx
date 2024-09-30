import * as React from 'react';
import { useEffect, useState } from 'react';
import { styled } from 'styled-components';
import { Alert, BodyLong, BodyShort, Button, Detail, Heading, HStack } from '@navikt/ds-react';
import { AFontWeightBold, ASpacing3 } from '@navikt/ds-tokens/dist/tokens';
import { RessursStatus } from '@navikt/familie-typer';
import { BrevmottakereAlert } from './BrevmottakereAlert';
import { useFeilutbetalingVedtak } from './FeilutbetalingVedtakContext';
import ForhåndsvisVedtaksbrev from './ForhåndsvisVedtaksbrev/ForhåndsvisVedtaksbrev';
import VedtakPerioder from './VedtakPerioder';
import VedtakSkjema from './VedtakSkjema';
import { useBehandling } from '../../../context/BehandlingContext';
import { vedtaksresultater } from '../../../kodeverk';
import {
    Behandlingssteg,
    Behandlingstype,
    Behandlingårsak,
    IBehandling,
} from '../../../typer/behandling';
import { IFagsak } from '../../../typer/fagsak';
import { HarBrukerUttaltSegValg } from '../../../typer/feilutbetalingtyper';
import { Navigering, Spacer20 } from '../../Felleskomponenter/Flytelementer';
import { sider } from '../../Felleskomponenter/Venstremeny/sider';
import DataLastIkkeSuksess from '../../Felleskomponenter/Datalast/DataLastIkkeSuksess';
import { useSlåSammenPerioder } from '../../../hooks/useSlåSammenPerioder';
import { useErPerioderSlåttSammen } from '../../../hooks/useErPerioderSlåttSammen';
import { useSjekkLikhetPerioder } from '../../../hooks/useSjekklikheter';

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
        behandling.behandlingsårsakstype === Behandlingårsak.REVURDERING_KLAGE_KA;
    const erRevurderingBortfaltBeløp =
        behandling.type === Behandlingstype.REVURDERING_TILBAKEKREVING &&
        behandling.behandlingsårsakstype ===
            Behandlingårsak.REVURDERING_FEILUTBETALT_BELØP_HELT_ELLER_DELVIS_BORTFALT;

    const { erPerioderLike, hentSjekkLikhetPerioder } = useSjekkLikhetPerioder(
        behandling.behandlingId
    );
    const [skalSammenslåTekster, settSkalSammenslåTekster] = useState<boolean>(erPerioderLike);
    const { erPerioderSlåttSammen, hentErPerioderSlåttSammen } = useErPerioderSlåttSammen(
        behandling.behandlingId
    );

    const { slåSammenPerioder, feilmelding } = useSlåSammenPerioder(
        behandling.behandlingId,
        !erPerioderSlåttSammen
    );

    const handleSlåSammenPerioder = async () => {
        console.log('handleSlåSammenPerioder');
        await slåSammenPerioder();
        settSkalSammenslåTekster(!skalSammenslåTekster);
        hentVedtaksbrevtekster();
    };

    useEffect(() => {
        const fetch = async () => {
            await hentSjekkLikhetPerioder();
            console.log('Henter hentSjekkLikhetPerioder');
        };
        fetch();
    }, [hentSjekkLikhetPerioder]);

    useEffect(() => {
        const fetch = async () => {
            await hentErPerioderSlåttSammen();
        };
        fetch();
    }, [hentErPerioderSlåttSammen]);

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
                aktivtSteg?.behandlingssteg === Behandlingssteg.FATTE_VEDTAK)) &&
        !erRevurderingKlageKA;

    if (
        beregningsresultat?.status === RessursStatus.SUKSESS &&
        feilutbetalingVedtaksbrevavsnitt?.status === RessursStatus.SUKSESS
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
                        HarBrukerUttaltSegValg.JA
                    }
                />
                <Spacer20 />
                {foreslåVedtakRespons &&
                    (foreslåVedtakRespons.status === RessursStatus.FEILET ||
                        foreslåVedtakRespons.status === RessursStatus.FUNKSJONELL_FEIL) && (
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
                            <Button variant="tertiary" onClick={handleSlåSammenPerioder}>
                                {!erPerioderSlåttSammen
                                    ? 'Sammenslå perioder'
                                    : 'Angre sammenslåing'}
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
