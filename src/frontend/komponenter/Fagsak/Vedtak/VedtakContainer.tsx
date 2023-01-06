import * as React from 'react';

import styled from 'styled-components';

import { Alert, BodyLong, BodyShort, Heading, Loader } from '@navikt/ds-react';
import { AFontWeightBold, ASpacing1, ASpacing3 } from '@navikt/ds-tokens/dist/tokens';
import { RessursStatus } from '@navikt/familie-typer';

import { useBehandling } from '../../../context/BehandlingContext';
import { vedtaksresultater } from '../../../kodeverk';
import {
    Behandlingssteg,
    Behandlingstype,
    Behandlingårsak,
    IBehandling,
} from '../../../typer/behandling';
import { DetailBold, FTButton, Navigering, Spacer20 } from '../../Felleskomponenter/Flytelementer';
import { useFeilutbetalingVedtak } from './FeilutbetalingVedtakContext';
import ForhåndsvisVedtaksbrev from './ForhåndsvisVedtaksbrev/ForhåndsvisVedtaksbrev';
import VedtakPerioder from './VedtakPerioder';
import VedtakSkjema from './VedtakSkjema';

const StyledVedtak = styled.div`
    padding: ${ASpacing3};
`;

const HenterContainer = styled(StyledVedtak)`
    text-align: center;
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

const KnappeDiv = styled.div`
    & button {
        margin: 0 ${ASpacing1};
    }
`;

interface IProps {
    behandling: IBehandling;
}

const VedtakContainer: React.FC<IProps> = ({ behandling }) => {
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
    } = useFeilutbetalingVedtak();
    const { behandlingILesemodus, aktivtSteg } = useBehandling();
    const erLesevisning = !!behandlingILesemodus;
    const erRevurderingKlageKA =
        behandling.behandlingsårsakstype === Behandlingårsak.REVURDERING_KLAGE_KA;
    const erRevurderingBortfaltBeløp =
        behandling.type === Behandlingstype.REVURDERING_TILBAKEKREVING &&
        behandling.behandlingsårsakstype ===
            Behandlingårsak.REVURDERING_FEILUTBETALT_BELØP_HELT_ELLER_DELVIS_BORTFALT;

    React.useEffect(() => {
        // console.log('bør no trigge re-rendring');
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
        beregningsresultat?.status === RessursStatus.HENTER ||
        feilutbetalingVedtaksbrevavsnitt?.status === RessursStatus.HENTER
    ) {
        return (
            <HenterContainer>
                <BodyLong>Henting av feilutbetalingen tar litt tid.</BodyLong>
                <Loader size="2xlarge" title="henter..." transparent={false} variant="neutral" />
            </HenterContainer>
        );
    } else if (
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
                        <StyledAlert
                            variant="info"
                            children={
                                <VarselbrevInfo>
                                    Vedtaksbrev sendes ikke ut fra denne behandlingen.
                                </VarselbrevInfo>
                            }
                        />
                        <Spacer20 />
                    </>
                )}
                <DetailBold size="small">Resultat</DetailBold>
                <BodyLong size="small" spacing>
                    {vedtaksresultater[beregningsresultat.data.vedtaksresultat]}
                </BodyLong>
                <VedtakPerioder perioder={beregningsresultat.data.beregningsresultatsperioder} />
                <Spacer20 />
                <VedtakSkjema
                    avsnitter={skjemaData}
                    erLesevisning={erLesevisning}
                    erRevurderingBortfaltBeløp={erRevurderingBortfaltBeløp}
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
                    <div>
                        {!erLesevisning && (
                            <FTButton
                                variant="primary"
                                onClick={sendInnSkjema}
                                loading={senderInn}
                                disabled={senderInn || disableBekreft || harValideringsFeil}
                            >
                                Til godkjenning
                            </FTButton>
                        )}
                    </div>
                    <KnappeDiv>
                        {kanViseForhåndsvisning && <ForhåndsvisVedtaksbrev />}
                        {!erLesevisning && !erRevurderingKlageKA && (
                            <FTButton
                                variant="tertiary"
                                onClick={lagreUtkast}
                                loading={senderInn}
                                disabled={senderInn}
                            >
                                Lagre utkast
                            </FTButton>
                        )}
                    </KnappeDiv>
                    <div>
                        <FTButton variant="secondary" onClick={gåTilForrige}>
                            Forrige
                        </FTButton>
                    </div>
                </StyledNavigering>
            </StyledVedtak>
        );
    } else if (
        beregningsresultat?.status === RessursStatus.FEILET ||
        beregningsresultat?.status === RessursStatus.FUNKSJONELL_FEIL
    ) {
        return <Alert children={beregningsresultat.frontendFeilmelding} variant="error" />;
    } else if (
        feilutbetalingVedtaksbrevavsnitt?.status === RessursStatus.FEILET ||
        feilutbetalingVedtaksbrevavsnitt?.status === RessursStatus.FUNKSJONELL_FEIL
    ) {
        return (
            <Alert
                children={feilutbetalingVedtaksbrevavsnitt.frontendFeilmelding}
                variant="error"
            />
        );
    } else {
        return <div />;
    }
};

export default VedtakContainer;
