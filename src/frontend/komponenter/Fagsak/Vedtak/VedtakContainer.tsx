import * as React from 'react';

import styled from 'styled-components';

import AlertStripe from 'nav-frontend-alertstriper';
import { Knapp } from 'nav-frontend-knapper';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Normaltekst, UndertekstBold, Undertittel } from 'nav-frontend-typografi';

import { RessursStatus } from '@navikt/familie-typer';

import { useBehandling } from '../../../context/BehandlingContext';
import { vedtaksresultater } from '../../../kodeverk';
import { Behandlingstatus, IBehandling } from '../../../typer/behandling';
import { Navigering, Spacer20 } from '../../Felleskomponenter/Flytelementer';
import { useFeilutbetalingVedtak } from './FeilutbetalingVedtakContext';
import ForhåndsvisVedtaksbrev from './ForhåndsvisVedtaksbrev/ForhåndsvisVedtaksbrev';
import VedtakPerioder from './VedtakPerioder';
import VedtakSkjema from './VedtakSkjema';

const StyledVedtak = styled.div`
    padding: 10px;
`;

const HenterContainer = styled(StyledVedtak)`
    text-align: center;
`;

const StyledNavigering = styled(Navigering)`
    width: 90%;
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
        harPåkrevetFritekstMenIkkeUtfylt,
        foreslåVedtakRespons,
    } = useFeilutbetalingVedtak();
    const { behandlingILesemodus } = useBehandling();
    const erLesevisning = !!behandlingILesemodus;

    React.useEffect(() => {
        // console.log('bør no trigge re-rendring');
    }, [nonUsedKey]);

    if (!behandling) return null;

    const harValideringsFeil = skjemaData.some(avs =>
        avs.underavsnittsliste.some(uavs => uavs.harFeil)
    );

    const erAvsluttet = behandling.status === Behandlingstatus.AVSLUTTET;

    if (
        beregningsresultat?.status === RessursStatus.HENTER ||
        feilutbetalingVedtaksbrevavsnitt?.status === RessursStatus.HENTER
    ) {
        return (
            <HenterContainer>
                <Normaltekst>Henting av feilutbetalingen tar litt tid.</Normaltekst>
                <NavFrontendSpinner type="XXL" />
            </HenterContainer>
        );
    } else if (
        beregningsresultat?.status === RessursStatus.SUKSESS &&
        feilutbetalingVedtaksbrevavsnitt?.status === RessursStatus.SUKSESS
    ) {
        return (
            <StyledVedtak>
                {foreslåVedtakRespons &&
                    (foreslåVedtakRespons.status === RessursStatus.FEILET ||
                        foreslåVedtakRespons.status === RessursStatus.FUNKSJONELL_FEIL) && (
                        <>
                            <AlertStripe type="feil">
                                {foreslåVedtakRespons.frontendFeilmelding}
                            </AlertStripe>
                            <Spacer20 />
                        </>
                    )}
                <Undertittel>Vedtak</Undertittel>
                <Spacer20 />
                <UndertekstBold>Resultat</UndertekstBold>
                <Normaltekst>
                    {vedtaksresultater[beregningsresultat.data.vedtaksresultat]}
                </Normaltekst>
                <Spacer20 />
                <VedtakPerioder perioder={beregningsresultat.data.beregningsresultatsperioder} />
                <Spacer20 />
                <VedtakSkjema avsnitter={skjemaData} erLesevisning={erLesevisning} />
                <Spacer20 />
                <StyledNavigering>
                    <div>
                        {!erLesevisning && (
                            <Knapp
                                type={'hoved'}
                                mini={true}
                                onClick={sendInnSkjema}
                                spinner={senderInn}
                                autoDisableVedSpinner
                                disabled={senderInn || disableBekreft || harValideringsFeil}
                            >
                                Bekreft
                            </Knapp>
                        )}
                    </div>
                    <div>
                        {!harPåkrevetFritekstMenIkkeUtfylt &&
                            !harValideringsFeil &&
                            !erAvsluttet && <ForhåndsvisVedtaksbrev />}
                    </div>
                    <div>
                        <Knapp type={'standard'} mini={true} onClick={gåTilForrige}>
                            Forrige
                        </Knapp>
                    </div>
                </StyledNavigering>
            </StyledVedtak>
        );
    } else if (
        beregningsresultat?.status === RessursStatus.FEILET ||
        beregningsresultat?.status === RessursStatus.FUNKSJONELL_FEIL
    ) {
        return <AlertStripe children={beregningsresultat.frontendFeilmelding} type="feil" />;
    } else if (
        feilutbetalingVedtaksbrevavsnitt?.status === RessursStatus.FEILET ||
        feilutbetalingVedtaksbrevavsnitt?.status === RessursStatus.FUNKSJONELL_FEIL
    ) {
        return (
            <AlertStripe
                children={feilutbetalingVedtaksbrevavsnitt.frontendFeilmelding}
                type="feil"
            />
        );
    } else {
        return <div />;
    }
};

export default VedtakContainer;
