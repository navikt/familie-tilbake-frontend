import type { TotrinnGodkjenningOption } from './typer/totrinnSkjemaTyper';
import type { SynligSteg } from '../../../../utils/sider';

import { Alert, BodyShort, Button, Heading, Link, Radio, Textarea } from '@navikt/ds-react';
import * as React from 'react';
import { styled } from 'styled-components';

import { useTotrinnskontroll } from './TotrinnskontrollContext';
import {
    OptionGodkjent,
    OptionIkkeGodkjent,
    totrinnGodkjenningOptions,
} from './typer/totrinnSkjemaTyper';
import { useBehandlingState } from '../../../../context/BehandlingStateContext';
import { Behandlingssteg, behandlingssteg } from '../../../../typer/behandling';
import { RessursStatus } from '../../../../typer/ressurs';
import { finnSideForSteg } from '../../../../utils/sider';
import ArrowBox from '../../../Felleskomponenter/ArrowBox/ArrowBox';
import { Navigering } from '../../../Felleskomponenter/Flytelementer';
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

    const { aktivtSteg } = useBehandlingState();

    React.useEffect(() => {
        // console.log('bør no trigge re-rendring');
    }, [nonUsedKey]);

    if (totrinnkontroll?.status !== RessursStatus.Suksess) {
        return null;
    }
    const skalViseFeilmelding =
        fatteVedtakRespons &&
        (fatteVedtakRespons.status === RessursStatus.Feilet ||
            fatteVedtakRespons.status === RessursStatus.FunksjonellFeil);

    return (
        <>
            <Heading size="small" level="2">
                Fatte vedtak
            </Heading>
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-stable flex flex-col gap-2">
                {skalViseFeilmelding && (
                    <Alert variant="error">{fatteVedtakRespons.frontendFeilmelding}</Alert>
                )}
                {!erLesevisning && (
                    <Steginformasjon
                        behandletSteg={stegErBehandlet}
                        infotekst="Kontroller endrede opplysninger og faglige vurderinger"
                    />
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
                        <div key={totrinnSteg.behandlingssteg} className="flex flex-col gap-1">
                            <Link
                                href="#"
                                onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
                                onClick={() => navigerTilSide(side as SynligSteg)}
                            >
                                {behandlingssteg[totrinnSteg.behandlingssteg]}
                            </Link>
                            {erLesevisning ? (
                                <BodyShort>
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
                                            size="small"
                                        >
                                            {opt.label}
                                        </Radio>
                                    ))}
                                </HorisontalRadioGroup>
                            )}
                            {vurdertIkkeGodkjent && (
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
                            )}
                        </div>
                    );
                })}
                {!erLesevisning && (
                    <Navigering>
                        <Button
                            size="small"
                            onClick={sendInnSkjema}
                            loading={senderInn}
                            disabled={senderInn || disableBekreft || sendTilSaksbehandler}
                        >
                            Godkjenn vedtaket
                        </Button>
                        <Button
                            size="small"
                            onClick={sendInnSkjema}
                            loading={senderInn}
                            disabled={senderInn || disableBekreft || !sendTilSaksbehandler}
                        >
                            Send til saksbehandler
                        </Button>
                    </Navigering>
                )}
            </div>
        </>
    );
};

export default Totrinnskontroll;
