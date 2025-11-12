import type { TotrinnGodkjenningOption } from './typer/totrinnSkjemaTyper';
import type { SynligSteg } from '../../../../utils/sider';

import { Alert, BodyShort, Button, Label, Link, Radio, Textarea } from '@navikt/ds-react';
import * as React from 'react';
import { styled } from 'styled-components';

import { useTotrinnskontroll } from './TotrinnskontrollContext';
import {
    OptionGodkjent,
    OptionIkkeGodkjent,
    totrinnGodkjenningOptions,
} from './typer/totrinnSkjemaTyper';
import { useBehandling } from '../../../../context/BehandlingContext';
import { Behandlingssteg, behandlingssteg } from '../../../../typer/behandling';
import { RessursStatus } from '../../../../typer/ressurs';
import { finnSideForSteg } from '../../../../utils/sider';
import ArrowBox from '../../../Felleskomponenter/ArrowBox/ArrowBox';
import { Navigering, Spacer20 } from '../../../Felleskomponenter/Flytelementer';
import { HorisontalRadioGroup } from '../../../Felleskomponenter/Skjemaelementer';
import Steginformasjon from '../../../Felleskomponenter/Steginformasjon/StegInformasjon';

const AngreSendTilBeslutterContainer = styled.div`
    margin: 1rem 0;
`;

const Totrinnskontroll: React.FC = () => {
    const {
        totrinnkontroll,
        skjemaData,
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
        angreSendTilBeslutter,
        feilmelding,
        erLesevisning,
    } = useTotrinnskontroll();

    const { aktivtSteg } = useBehandling();

    React.useEffect(() => {
        // console.log('bør no trigge re-rendring');
    }, [nonUsedKey]);

    if (totrinnkontroll?.status !== RessursStatus.Suksess) {
        return null;
    }

    return (
        <>
            {fatteVedtakRespons &&
                (fatteVedtakRespons.status === RessursStatus.Feilet ||
                    fatteVedtakRespons.status === RessursStatus.FunksjonellFeil) && (
                    <>
                        <Alert variant="error">{fatteVedtakRespons.frontendFeilmelding}</Alert>
                        <Spacer20 />
                    </>
                )}
            {!erLesevisning && (
                <>
                    <Steginformasjon
                        behandletSteg={stegErBehandlet}
                        infotekst="Kontroller endrede opplysninger og faglige vurderinger"
                    />
                    <Spacer20 />
                </>
            )}
            {aktivtSteg?.behandlingssteg === Behandlingssteg.FatteVedtak && erLesevisning && (
                <AngreSendTilBeslutterContainer>
                    <Button size="small" variant="secondary" onClick={angreSendTilBeslutter}>
                        Angre sendt til beslutter
                    </Button>
                    {feilmelding && <Alert variant="error">{feilmelding}</Alert>}
                </AngreSendTilBeslutterContainer>
            )}
            {skjemaData.map(totrinnSteg => {
                const side = finnSideForSteg(totrinnSteg.behandlingssteg);
                const vurdertIkkeGodkjent = totrinnSteg.godkjent === OptionIkkeGodkjent;
                return (
                    <React.Fragment key={totrinnSteg.behandlingssteg}>
                        <div>
                            <Label>
                                <Link
                                    href="#"
                                    onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
                                    onClick={() => navigerTilSide(side as SynligSteg)}
                                >
                                    {behandlingssteg[totrinnSteg.behandlingssteg]}
                                </Link>
                            </Label>
                            {erLesevisning ? (
                                <BodyShort spacing>
                                    {totrinnSteg.godkjent === OptionGodkjent
                                        ? 'Godkjent'
                                        : totrinnSteg.godkjent === OptionIkkeGodkjent
                                          ? 'Vurder på nytt'
                                          : 'Ikke vurdert'}
                                </BodyShort>
                            ) : (
                                <HorisontalRadioGroup
                                    id={`stegetGodkjent_${totrinnSteg.index}`}
                                    legend={`Vurder steget ${
                                        behandlingssteg[totrinnSteg.behandlingssteg]
                                    }`}
                                    hideLegend
                                    value={totrinnSteg.godkjent}
                                    onChange={(val: TotrinnGodkjenningOption) =>
                                        oppdaterGodkjenning(totrinnSteg.index, val)
                                    }
                                    error={totrinnSteg.feilmelding ? totrinnSteg.feilmelding : null}
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
                                </HorisontalRadioGroup>
                            )}
                            {vurdertIkkeGodkjent && (
                                <>
                                    <ArrowBox alignOffset={erLesevisning ? 5 : 125}>
                                        <Textarea
                                            name={`ikkeGodkjentBegrunnelse_${totrinnSteg.index}`}
                                            label="Begrunnelse"
                                            readOnly={erLesevisning}
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
                    <Button
                        size="small"
                        variant="primary"
                        onClick={sendInnSkjema}
                        loading={senderInn}
                        disabled={senderInn || disableBekreft || sendTilSaksbehandler}
                    >
                        Godkjenn vedtaket
                    </Button>
                    <Button
                        size="small"
                        variant="primary"
                        onClick={sendInnSkjema}
                        loading={senderInn}
                        disabled={senderInn || disableBekreft || !sendTilSaksbehandler}
                    >
                        Send til saksbehandler
                    </Button>
                </Navigering>
            )}
        </>
    );
};

export default Totrinnskontroll;
