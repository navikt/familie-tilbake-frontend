import * as React from 'react';

import styled from 'styled-components';

import { Radio } from 'nav-frontend-skjema';

import { Alert, Link } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';

import { behandlingssteg } from '../../../../typer/behandling';
import ArrowBox from '../../../Felleskomponenter/ArrowBox/ArrowBox';
import { FTButton, Navigering, Spacer20 } from '../../../Felleskomponenter/Flytelementer';
import {
    FamilieTilbakeTextArea,
    HorisontalFamilieRadioGruppe,
} from '../../../Felleskomponenter/Skjemaelementer';
import Steginformasjon from '../../../Felleskomponenter/Steginformasjon/StegInformasjon';
import { finnSideForSteg, ISide } from '../../../Felleskomponenter/Venstremeny/sider';
import { useTotrinnskontroll } from './TotrinnskontrollContext';
import {
    OptionGodkjent,
    OptionIkkeGodkjent,
    totrinnGodkjenningOptions,
} from './typer/totrinnSkjemaTyper';

const StyledContainer = styled.div`
    margin-top: 10px;
`;

const Totrinnskontroll: React.FC = () => {
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
                                <Alert variant="error">
                                    {fatteVedtakRespons.frontendFeilmelding}
                                </Alert>
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
                                            <Link
                                                href="#"
                                                onMouseDown={(e: React.MouseEvent) =>
                                                    e.preventDefault()
                                                }
                                                onClick={() => navigerTilSide(side as ISide)}
                                            >
                                                {behandlingssteg[totrinnSteg.behandlingssteg]}
                                            </Link>
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
                                                data-testid={`stegetGodkjent_${totrinnSteg.index}-${opt.verdi}`}
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
                                <FTButton
                                    size="small"
                                    variant="primary"
                                    onClick={sendInnSkjema}
                                    loading={senderInn}
                                    disabled={senderInn || disableBekreft || sendTilSaksbehandler}
                                >
                                    Godkjenn
                                    <br />
                                    vedtaket
                                </FTButton>
                            </div>
                            <div>
                                <FTButton
                                    size="small"
                                    variant="primary"
                                    onClick={sendInnSkjema}
                                    loading={senderInn}
                                    disabled={senderInn || disableBekreft || !sendTilSaksbehandler}
                                >
                                    Send til
                                    <br />
                                    saksbehandler
                                </FTButton>
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
