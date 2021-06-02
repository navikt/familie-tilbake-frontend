import * as React from 'react';

import styled from 'styled-components';

import AlertStripe from 'nav-frontend-alertstriper';
import { Knapp } from 'nav-frontend-knapper';
import Lenke from 'nav-frontend-lenker';
import { Radio } from 'nav-frontend-skjema';

import { RessursStatus } from '@navikt/familie-typer';

import { behandlingssteg, IBehandling } from '../../../../typer/behandling';
import { IFagsak } from '../../../../typer/fagsak';
import ArrowBox from '../../../Felleskomponenter/ArrowBox/ArrowBox';
import { Navigering, Spacer20 } from '../../../Felleskomponenter/Flytelementer';
import {
    FamilieTilbakeTextArea,
    HorisontalFamilieRadioGruppe,
} from '../../../Felleskomponenter/Skjemaelementer';
import Steginformasjon from '../../../Felleskomponenter/Steginformasjon/StegInformasjon';
import { finnSideForSteg } from '../../../Felleskomponenter/Venstremeny/sider';
import { useTotrinnskontroll } from './TotrinnskontrollContext';
import {
    OptionGodkjent,
    OptionIkkeGodkjent,
    totrinnGodkjenningOptions,
} from './typer/totrinnSkjemaTyper';

const StyledContainer = styled.div`
    margin-top: 10px;
`;

interface IProps {
    fagsak: IFagsak;
    behandling: IBehandling;
}

const Totrinnskontroll: React.FC<IProps> = () => {
    const {
        totrinnkontroll,
        skjemaData,
        fatteVedtakILåsemodus,
        nonUsedKey,
        oppdaterGodkjenning,
        oppdaterBegrunnelse,
        stegErBehandlet,
        navigerTilSide,
        sendInnSkjema,
        disableBekreft,
        sendTilSaksbehandler,
        senderInn,
        fatteVedtakRespons,
    } = useTotrinnskontroll();
    const erLesevisning = fatteVedtakILåsemodus;

    React.useEffect(() => {
        // console.log('bør no trigge re-rendring');
    }, [nonUsedKey]);

    switch (totrinnkontroll?.status) {
        case RessursStatus.SUKSESS:
            return (
                <StyledContainer>
                    {fatteVedtakRespons &&
                        (fatteVedtakRespons.status === RessursStatus.FEILET ||
                            fatteVedtakRespons.status === RessursStatus.FUNKSJONELL_FEIL) && (
                            <>
                                <AlertStripe type="feil">
                                    {fatteVedtakRespons.frontendFeilmelding}
                                </AlertStripe>
                                <Spacer20 />
                            </>
                        )}
                    {!fatteVedtakILåsemodus && (
                        <>
                            <Steginformasjon
                                behandletSteg={stegErBehandlet}
                                infotekst={'Kontroller endrede opplysninger og faglige vurderinger'}
                            />
                            <Spacer20 />
                        </>
                    )}
                    {skjemaData.map(totrinnSteg => {
                        const side = finnSideForSteg(totrinnSteg.behandlingssteg);
                        const vurdertIkkeGodkjent = totrinnSteg.godkjent === OptionIkkeGodkjent;
                        return (
                            <React.Fragment key={totrinnSteg.behandlingssteg}>
                                <div>
                                    <HorisontalFamilieRadioGruppe
                                        id={`stegetGodkjent_${totrinnSteg.index}`}
                                        erLesevisning={erLesevisning}
                                        legend={
                                            <Lenke
                                                href="#"
                                                onMouseDown={e => e.preventDefault()}
                                                // @ts-ignore
                                                onClick={() => navigerTilSide(side)}
                                            >
                                                {behandlingssteg[totrinnSteg.behandlingssteg]}
                                            </Lenke>
                                        }
                                        verdi={
                                            totrinnSteg.godkjent === OptionGodkjent
                                                ? 'Godkjent'
                                                : totrinnSteg.godkjent === OptionIkkeGodkjent
                                                ? 'Vurder på nytt'
                                                : 'Ikke vurdert'
                                        }
                                    >
                                        {totrinnGodkjenningOptions.map(opt => (
                                            <Radio
                                                key={opt.label}
                                                name={`stegetGodkjent_${totrinnSteg.index}`}
                                                label={opt.label}
                                                checked={totrinnSteg.godkjent === opt}
                                                onChange={() =>
                                                    oppdaterGodkjenning(totrinnSteg.index, opt)
                                                }
                                            />
                                        ))}
                                    </HorisontalFamilieRadioGruppe>
                                    {vurdertIkkeGodkjent && (
                                        <>
                                            <ArrowBox alignOffset={erLesevisning ? 5 : 125}>
                                                <FamilieTilbakeTextArea
                                                    name={`ikkeGodkjentBegrunnelse_${totrinnSteg.index}`}
                                                    label="Begrunnelse"
                                                    erLesevisning={erLesevisning}
                                                    value={totrinnSteg.begrunnelse || ''}
                                                    maxLength={2000}
                                                    onChange={event =>
                                                        oppdaterBegrunnelse(
                                                            totrinnSteg.index,
                                                            event.target.value
                                                        )
                                                    }
                                                    feil={
                                                        totrinnSteg.harFeilIBegrunnelse
                                                            ? totrinnSteg.begrunnelseFeilmelding
                                                            : null
                                                    }
                                                />
                                            </ArrowBox>
                                        </>
                                    )}
                                </div>
                            </React.Fragment>
                        );
                    })}
                    {!erLesevisning && (
                        <Navigering>
                            <div>
                                <Knapp
                                    type={'hoved'}
                                    mini={true}
                                    onClick={sendInnSkjema}
                                    spinner={senderInn}
                                    autoDisableVedSpinner
                                    disabled={senderInn || disableBekreft || sendTilSaksbehandler}
                                >
                                    Godkjenn
                                    <br />
                                    vedtaket
                                </Knapp>
                            </div>
                            <div>
                                <Knapp
                                    type={'hoved'}
                                    mini={true}
                                    onClick={sendInnSkjema}
                                    spinner={senderInn}
                                    autoDisableVedSpinner
                                    disabled={senderInn || disableBekreft || !sendTilSaksbehandler}
                                >
                                    Send til
                                    <br />
                                    saksbehandler
                                </Knapp>
                            </div>
                        </Navigering>
                    )}
                </StyledContainer>
            );
        default:
            return null;
    }
};

export default Totrinnskontroll;
