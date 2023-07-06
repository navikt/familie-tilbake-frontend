import * as React from 'react';

import styled from 'styled-components';

import { Alert, Link, Radio } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';

import { useTotrinnskontroll } from './TotrinnskontrollContext';
import {
    OptionGodkjent,
    OptionIkkeGodkjent,
    TotrinnGodkjenningOption,
    totrinnGodkjenningOptions,
} from './typer/totrinnSkjemaTyper';
import { behandlingssteg } from '../../../../typer/behandling';
import ArrowBox from '../../../Felleskomponenter/ArrowBox/ArrowBox';
import { FTButton, Navigering, Spacer20 } from '../../../Felleskomponenter/Flytelementer';
import {
    FamilieTilbakeTextArea,
    HorisontalFamilieRadioGruppe,
} from '../../../Felleskomponenter/Skjemaelementer';
import Steginformasjon from '../../../Felleskomponenter/Steginformasjon/StegInformasjon';
import { finnSideForSteg, ISide } from '../../../Felleskomponenter/Venstremeny/sider';

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
                                        value={
                                            !erLesevisning
                                                ? totrinnSteg.godkjent
                                                : totrinnSteg.godkjent === OptionGodkjent
                                                ? 'Godkjent'
                                                : totrinnSteg.godkjent === OptionIkkeGodkjent
                                                ? 'Vurder på nytt'
                                                : 'Ikke vurdert'
                                        }
                                        onChange={(val: TotrinnGodkjenningOption) =>
                                            oppdaterGodkjenning(totrinnSteg.index, val)
                                        }
                                        error={
                                            totrinnSteg.feilmelding ? totrinnSteg.feilmelding : null
                                        }
                                    >
                                        {totrinnGodkjenningOptions.map(opt => (
                                            <Radio
                                                key={opt.label}
                                                name={`stegetGodkjent_${totrinnSteg.index}`}
                                                data-testid={`stegetGodkjent_${totrinnSteg.index}-${opt.verdi}`}
                                                value={opt}
                                            >
                                                {opt.label}
                                            </Radio>
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
                                                    error={
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
