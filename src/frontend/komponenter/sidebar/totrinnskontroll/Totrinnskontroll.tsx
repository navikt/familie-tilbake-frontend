import type { TotrinnGodkjenningOption } from './typer/totrinnSkjemaTyper';
import type { FC, MouseEvent } from 'react';
import type { SynligSteg } from '~/utils/sider';

import { BodyShort, Button, Link, LocalAlert, Radio, Textarea, RadioGroup } from '@navikt/ds-react';
import { useEffect, useRef } from 'react';

import { useBehandling } from '~/context/BehandlingContext';
import { useBehandlingState } from '~/context/BehandlingStateContext';
import { Bekreftelsesmodal } from '~/komponenter/modal/bekreftelse/Bekreftelsesmodal';
import { Steginformasjon } from '~/komponenter/steginformasjon/StegInformasjon';
import { behandlingssteg } from '~/typer/behandling';
import { RessursStatus } from '~/typer/ressurs';
import { finnSideForSteg } from '~/utils/sider';

import { useTotrinnskontroll } from './TotrinnskontrollContext';
import {
    OptionGodkjent,
    OptionIkkeGodkjent,
    totrinnGodkjenningOptions,
} from './typer/totrinnSkjemaTyper';

export const Totrinnskontroll: FC = () => {
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
    const { erNyModell } = useBehandling();
    const { aktivtSteg } = useBehandlingState();
    const bekreftelsesmodalRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
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
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-stable flex flex-col gap-2">
                {skalViseFeilmelding && (
                    <LocalAlert status="error">
                        <LocalAlert.Header>
                            <LocalAlert.Title>Kunne ikke sende vedtaket</LocalAlert.Title>
                        </LocalAlert.Header>
                        <LocalAlert.Content>
                            {fatteVedtakRespons.frontendFeilmelding}
                        </LocalAlert.Content>
                    </LocalAlert>
                )}
                {!erLesevisning && (
                    <Steginformasjon
                        behandletSteg={stegErBehandlet}
                        infotekst="Kontroller endrede opplysninger og faglige vurderinger"
                    />
                )}
                {aktivtSteg?.behandlingssteg === 'FATTE_VEDTAK' && erLesevisning && (
                    <div>
                        <Button size="small" variant="secondary" onClick={angreSendTilBeslutter}>
                            Angre sendt til beslutter
                        </Button>
                        {feilmelding && (
                            <LocalAlert status="error">
                                <LocalAlert.Header>
                                    <LocalAlert.Title>{feilmelding}</LocalAlert.Title>
                                </LocalAlert.Header>
                            </LocalAlert>
                        )}
                    </div>
                )}
                {skjemaData.map(totrinnSteg => {
                    const side = finnSideForSteg(totrinnSteg.behandlingssteg);
                    const vurdertIkkeGodkjent = totrinnSteg.godkjent === OptionIkkeGodkjent;
                    return (
                        <div key={totrinnSteg.behandlingssteg} className="flex flex-col gap-1">
                            <Link
                                href="#"
                                onMouseDown={(e: MouseEvent) => e.preventDefault()}
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
                                <RadioGroup
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
                                </RadioGroup>
                            )}
                            {vurdertIkkeGodkjent && (
                                <Textarea
                                    name={`ikkeGodkjentBegrunnelse_${totrinnSteg.index}`}
                                    label="Begrunnelse"
                                    readOnly={erLesevisning}
                                    value={totrinnSteg.begrunnelse || ''}
                                    maxLength={2000}
                                    onChange={event =>
                                        oppdaterBegrunnelse(totrinnSteg.index, event.target.value)
                                    }
                                    error={
                                        totrinnSteg.harFeilIBegrunnelse
                                            ? totrinnSteg.begrunnelseFeilmelding
                                            : null
                                    }
                                />
                            )}
                        </div>
                    );
                })}
                {!erLesevisning && (
                    <div className="flex flex-row-reverse">
                        <Button
                            size="small"
                            onClick={() => bekreftelsesmodalRef.current?.showModal()}
                            loading={senderInn}
                            disabled={senderInn || disableBekreft || sendTilSaksbehandler}
                        >
                            Godkjenn vedtaket
                        </Button>
                        <Button
                            size="small"
                            onClick={() => sendInnSkjema()}
                            loading={senderInn}
                            disabled={senderInn || disableBekreft || !sendTilSaksbehandler}
                        >
                            Send til saksbehandler
                        </Button>
                    </div>
                )}
                <Bekreftelsesmodal
                    dialogRef={bekreftelsesmodalRef}
                    tekster={{
                        overskrift: 'Godkjenn vedtaket',
                        brødtekst: erNyModell ? 'Denne handlingen kan ikke angres.' : undefined,
                        bekreftTekst: 'Godkjenn vedtaket',
                    }}
                    onBekreft={() => sendInnSkjema(() => bekreftelsesmodalRef.current?.close())}
                    laster={senderInn}
                />
            </div>
        </>
    );
};
