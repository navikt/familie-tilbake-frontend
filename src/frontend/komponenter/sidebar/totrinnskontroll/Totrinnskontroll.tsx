import type { ChangeEvent, FC, MouseEvent } from 'react';
import type { SynligSteg } from '@/utils/sider';
import type { TotrinnGodkjenningOption } from './typer/totrinnSkjemaTyper';

import {
    BodyShort,
    Button,
    Link,
    LocalAlert,
    Radio,
    RadioGroup,
    Textarea,
    VStack,
} from '@navikt/ds-react';
import { useEffect, useRef } from 'react';

import { useBehandlingState } from '@/context/BehandlingStateContext';
import { Bekreftelsesmodal } from '@/komponenter/modal/bekreftelse/Bekreftelsesmodal';
import { Steginformasjon } from '@/komponenter/steginformasjon/StegInformasjon';
import { behandlingssteg } from '@/typer/behandling';
import { RessursStatus } from '@/typer/ressurs';
import { finnSideForSteg } from '@/utils/sider';

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
        senderInn,
        angreSendTilBeslutter,
        feilmelding,
        erLesevisning,
    } = useTotrinnskontroll();
    const { aktivtSteg } = useBehandlingState();
    const bekreftelsesmodalRef = useRef<HTMLDialogElement>(null);

    // biome-ignore lint/correctness/useExhaustiveDependencies: Skal skrives om senere. Skal ikke bruke useEffect for å trigge ny render.
    useEffect(() => {
        // console.log('bør no trigge re-rendring');
    }, [nonUsedKey]);

    if (totrinnkontroll?.status !== RessursStatus.Suksess) {
        return null;
    }

    const skalVurderePåNytt = skjemaData.some(steg => steg.godkjent === OptionIkkeGodkjent);

    return (
        <VStack gap="space-16" padding="space-2" justify="space-between" className="min-h-full">
            <VStack gap="space-16" justify="space-between" height="100%">
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
                        <VStack key={totrinnSteg.behandlingssteg} gap="space-4">
                            <Link
                                href="#"
                                onMouseDown={(
                                    e: MouseEvent<Element, globalThis.MouseEvent>
                                ): void => e.preventDefault()}
                                onClick={(): void => navigerTilSide(side as SynligSteg)}
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
                                    onChange={(val: TotrinnGodkjenningOption): void =>
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
                                    className="max-w-xl"
                                    onChange={(event: ChangeEvent<HTMLTextAreaElement>): void =>
                                        oppdaterBegrunnelse(totrinnSteg.index, event.target.value)
                                    }
                                    error={
                                        totrinnSteg.harFeilIBegrunnelse
                                            ? totrinnSteg.begrunnelseFeilmelding
                                            : null
                                    }
                                />
                            )}
                        </VStack>
                    );
                })}
            </VStack>
            {!erLesevisning && (
                <Button
                    onClick={
                        skalVurderePåNytt
                            ? async (): Promise<void> => await sendInnSkjema()
                            : (): void => bekreftelsesmodalRef.current?.showModal()
                    }
                    loading={senderInn}
                    disabled={senderInn || disableBekreft}
                >
                    {skalVurderePåNytt ? 'Returner til saksbehandler' : 'Godkjenn vedtaket'}
                </Button>
            )}
            <Bekreftelsesmodal
                dialogRef={bekreftelsesmodalRef}
                tekster={{
                    overskrift: 'Godkjenn vedtaket',
                    brødtekst: 'Denne handlingen kan ikke angres.',
                    bekreftTekst: 'Godkjenn vedtaket',
                }}
                onBekreft={async (): Promise<void> =>
                    await sendInnSkjema(() => bekreftelsesmodalRef.current?.close())
                }
                laster={senderInn}
            />
        </VStack>
    );
};
