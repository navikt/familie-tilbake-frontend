import type { TotrinnStegSkjemaData } from './typer/totrinnSkjemaTyper';
import type { SynligSteg } from '~/utils/sider';

import { ArrowCirclepathReverseIcon, CheckmarkIcon, XMarkIcon } from '@navikt/aksel-icons';
import {
    BodyLong,
    Button,
    Heading,
    HStack,
    InlineMessage,
    Link,
    LocalAlert,
    Textarea,
    VStack,
} from '@navikt/ds-react';
import React, { useState } from 'react';

import { useBehandling } from '~/context/BehandlingContext';
import { useBehandlingState } from '~/context/BehandlingStateContext';
import { BekreftelsesModal } from '~/komponenter/modal/bekreftelse/BekreftelsesModal';
import { behandlingssteg } from '~/typer/behandling';
import { RessursStatus } from '~/typer/ressurs';
import { finnSideForSteg } from '~/utils/sider';

import { useTotrinnskontroll } from './TotrinnskontrollContext';
import { TotrinnskontrollSkeleton } from './TotrinnskontrollSkeleton';
import { OptionGodkjent, OptionIkkeGodkjent } from './typer/totrinnSkjemaTyper';

const utledOverskrift = (
    aktivtStegErFatteVedtak: boolean,
    erLesevisning: boolean,
    erReturnertFraBeslutter: boolean
): string => {
    if (erReturnertFraBeslutter) {
        return 'Vurdering fra godkjenner';
    }
    if (aktivtStegErFatteVedtak && erLesevisning) {
        return 'Venter på vurdering';
    }
    return 'Fatter vedtak';
};

type TotrinnStegBoksProps = {
    totrinnSteg: TotrinnStegSkjemaData;
    erLesevisning: boolean;
    erVenterPåVurdering: boolean;
    navigerTilSide: (side: SynligSteg) => void;
    oppdaterGodkjenning: (
        stegIndex: string,
        verdi: typeof OptionGodkjent | typeof OptionIkkeGodkjent
    ) => void;
    oppdaterBegrunnelse: (stegIndex: string, verdi: string) => void;
};

type VurderingsknappProps = {
    totrinnSteg: TotrinnStegSkjemaData;
    erGodkjent: boolean;
    erIkkeGodkjent: boolean;
    oppdaterGodkjenning: TotrinnStegBoksProps['oppdaterGodkjenning'];
    disabled?: boolean;
    erVenterPåVurdering?: boolean;
};

const Vurderingsknapper: React.FC<VurderingsknappProps> = ({
    totrinnSteg,
    erGodkjent,
    erIkkeGodkjent,
    oppdaterGodkjenning,
    disabled = false,
    erVenterPåVurdering = false,
}) => {
    const [hoverGodkjent, setHoverGodkjent] = useState(false);
    const [hoverIkkeGodkjent, setHoverIkkeGodkjent] = useState(false);

    const visGodkjentTekst = erGodkjent || (!disabled && hoverGodkjent);
    const visIkkeGodkjentTekst = erIkkeGodkjent || (!disabled && hoverIkkeGodkjent);
    const visVenterTekst = erVenterPåVurdering && !erGodkjent && !erIkkeGodkjent;
    const visTekst = visGodkjentTekst || visIkkeGodkjentTekst || visVenterTekst;

    const utledTekst = (): string => {
        if (visGodkjentTekst) return 'Godkjent';
        if (visIkkeGodkjentTekst) return 'Vurder på nytt';
        return 'Venter';
    };

    const utledFarge = (): 'neutral' | 'success' | 'warning' => {
        if (visGodkjentTekst) return 'success';
        if (visIkkeGodkjentTekst) return 'warning';
        return 'neutral';
    };

    return (
        <div className="flex items-center gap-2">
            {visTekst && (
                <BodyLong size="small" data-color={utledFarge()}>
                    {utledTekst()}
                </BodyLong>
            )}
            <Button
                variant="tertiary"
                size="small"
                icon={<CheckmarkIcon aria-hidden />}
                title="Godkjenn"
                aria-pressed={erGodkjent}
                onMouseEnter={() => setHoverGodkjent(true)}
                onMouseLeave={() => setHoverGodkjent(false)}
                onClick={() => oppdaterGodkjenning(totrinnSteg.index, OptionGodkjent)}
                data-color={visGodkjentTekst ? 'success' : 'neutral'}
                className="aria-pressed:bg-ax-bg-success-moderate disabled:opacity-100"
                disabled={disabled}
                data-testid={`stegetGodkjent_${totrinnSteg.index}-true`}
            />
            <Button
                variant="tertiary"
                size="small"
                icon={<ArrowCirclepathReverseIcon aria-hidden />}
                title="Vurder på nytt"
                aria-pressed={erIkkeGodkjent}
                onMouseEnter={() => setHoverIkkeGodkjent(true)}
                onMouseLeave={() => setHoverIkkeGodkjent(false)}
                onClick={() => oppdaterGodkjenning(totrinnSteg.index, OptionIkkeGodkjent)}
                data-color={visIkkeGodkjentTekst ? 'warning' : 'neutral'}
                className="aria-pressed:bg-ax-bg-warning-moderate disabled:opacity-100"
                disabled={disabled}
                data-testid={`stegetGodkjent_${totrinnSteg.index}-false`}
            />
        </div>
    );
};

const TotrinnStegBoks: React.FC<TotrinnStegBoksProps> = ({
    totrinnSteg,
    erLesevisning,
    erVenterPåVurdering,
    navigerTilSide,
    oppdaterGodkjenning,
    oppdaterBegrunnelse,
}) => {
    const side = finnSideForSteg(totrinnSteg.behandlingssteg);
    const erGodkjent = totrinnSteg.godkjent === OptionGodkjent;
    const erIkkeGodkjent = totrinnSteg.godkjent === OptionIkkeGodkjent;
    const harValideringsfeil = !!totrinnSteg.feilmelding;

    return (
        <VStack
            className={`${harValideringsfeil ? 'border-ax-border-danger' : 'border-ax-border-neutral-subtle'} border rounded-xl`}
            paddingBlock="space-12"
            paddingInline="space-16"
            gap="space-16"
        >
            <div className="flex items-center justify-between gap-2">
                <Link
                    href="#"
                    data-color="neutral"
                    onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
                    onClick={() => navigerTilSide(side as SynligSteg)}
                >
                    {behandlingssteg[totrinnSteg.behandlingssteg]}
                </Link>

                <Vurderingsknapper
                    totrinnSteg={totrinnSteg}
                    erGodkjent={erGodkjent}
                    erIkkeGodkjent={erIkkeGodkjent}
                    oppdaterGodkjenning={oppdaterGodkjenning}
                    disabled={erLesevisning}
                    erVenterPåVurdering={erVenterPåVurdering}
                />
            </div>

            {erIkkeGodkjent && (
                <div>
                    <Textarea
                        name={`ikkeGodkjentBegrunnelse_${totrinnSteg.index}`}
                        label={
                            erLesevisning
                                ? 'Årsak til ny vurdering'
                                : 'Begrunn hvorfor steget må vurderes på nytt'
                        }
                        readOnly={erLesevisning}
                        value={totrinnSteg.begrunnelse || ''}
                        maxLength={2000}
                        resize
                        maxRows={2}
                        onChange={event =>
                            oppdaterBegrunnelse(totrinnSteg.index, event.target.value)
                        }
                        error={
                            totrinnSteg.harFeilIBegrunnelse
                                ? totrinnSteg.begrunnelseFeilmelding
                                : null
                        }
                    />
                </div>
            )}
        </VStack>
    );
};

export const Totrinnskontroll: React.FC = () => {
    const {
        totrinnkontroll,
        skjemaData,
        oppdaterGodkjenning,
        oppdaterBegrunnelse,
        navigerTilSide,
        validerToTrinn,
        sendInnSkjema,
        sendTilSaksbehandler,
        senderInn,
        fatteVedtakRespons,
        angreSendTilBeslutter,
        feilmelding,
        erLesevisning,
    } = useTotrinnskontroll();
    const { erNyModell } = useBehandling();
    const { aktivtSteg, erBehandlingReturnertFraBeslutter } = useBehandlingState();
    const [visBekreftelsesmodal, setVisBekreftelsesmodal] = useState(false);

    if (
        !totrinnkontroll ||
        totrinnkontroll.status === RessursStatus.Henter ||
        totrinnkontroll.status === RessursStatus.IkkeHentet
    ) {
        return <TotrinnskontrollSkeleton />;
    }

    if (totrinnkontroll.status !== RessursStatus.Suksess) {
        return (
            <LocalAlert status="error">
                <LocalAlert.Content>{totrinnkontroll.frontendFeilmelding}</LocalAlert.Content>
            </LocalAlert>
        );
    }

    const skalViseFeilmelding =
        fatteVedtakRespons &&
        (fatteVedtakRespons.status === RessursStatus.Feilet ||
            fatteVedtakRespons.status === RessursStatus.FunksjonellFeil);

    const harValideringsfeil = skjemaData.some(
        steg => steg.feilmelding || steg.harFeilIBegrunnelse
    );

    const aktivtStegErFatteVedtak = aktivtSteg?.behandlingssteg === 'FATTE_VEDTAK';
    const erReturnert = erBehandlingReturnertFraBeslutter();
    const erVenterPåVurdering = aktivtStegErFatteVedtak && erLesevisning && !erReturnert;
    const overskrift = utledOverskrift(aktivtStegErFatteVedtak, erLesevisning, erReturnert);

    return (
        <>
            <HStack justify="space-between" align="center">
                <Heading size="small" level="2">
                    {overskrift}
                </Heading>
                {aktivtSteg?.behandlingssteg === 'FATTE_VEDTAK' && erLesevisning && !erNyModell && (
                    <Button
                        size="xsmall"
                        variant="tertiary"
                        icon={<XMarkIcon />}
                        iconPosition="right"
                        onClick={angreSendTilBeslutter}
                    >
                        Avbryt
                    </Button>
                )}
            </HStack>
            <VStack gap="space-12" className="flex-1 overflow-y-auto scrollbar-stable">
                {skalViseFeilmelding && (
                    <LocalAlert status="error">
                        <LocalAlert.Content>
                            {fatteVedtakRespons.frontendFeilmelding}
                        </LocalAlert.Content>
                    </LocalAlert>
                )}

                <VStack gap="space-12" justify="space-between" className="flex-1">
                    <VStack gap="space-12">
                        {skjemaData.map(totrinnSteg => (
                            <TotrinnStegBoks
                                key={totrinnSteg.behandlingssteg}
                                totrinnSteg={totrinnSteg}
                                erLesevisning={erLesevisning}
                                erVenterPåVurdering={erVenterPåVurdering}
                                navigerTilSide={navigerTilSide}
                                oppdaterGodkjenning={oppdaterGodkjenning}
                                oppdaterBegrunnelse={oppdaterBegrunnelse}
                            />
                        ))}
                        {harValideringsfeil && (
                            <InlineMessage status="error">
                                Du må velge om stegene skal godkjennes eller vurderes på nytt før du
                                går videre
                            </InlineMessage>
                        )}
                        {feilmelding && (
                            <LocalAlert status="error">
                                <LocalAlert.Content>{feilmelding}</LocalAlert.Content>
                            </LocalAlert>
                        )}
                    </VStack>
                    {!erLesevisning && (
                        <Button
                            size="small"
                            className="w-full"
                            onClick={() => {
                                if (validerToTrinn()) {
                                    sendTilSaksbehandler
                                        ? sendInnSkjema()
                                        : setVisBekreftelsesmodal(true);
                                }
                            }}
                            loading={senderInn}
                        >
                            {sendTilSaksbehandler
                                ? 'Returner til saksbehandler'
                                : 'Godkjenn vedtak'}
                        </Button>
                    )}
                </VStack>
                <BekreftelsesModal
                    åpen={visBekreftelsesmodal}
                    onLukk={() => setVisBekreftelsesmodal(false)}
                    overskrift="Godkjenn vedtaket"
                    brødtekst={erNyModell ? 'Denne handlingen kan ikke angres.' : undefined}
                    bekreftTekst="Godkjenn vedtaket"
                    onBekreft={() => sendInnSkjema(() => setVisBekreftelsesmodal(false))}
                    laster={senderInn}
                />
            </VStack>
        </>
    );
};
