import type { VilkårsvurderingPeriodeSkjemaData } from './typer/feilutbetalingVilkårsvurdering';
import type { IBehandling } from '../../../typer/behandling';
import type { IFagsak } from '../../../typer/fagsak';

import { BodyShort, Button, VStack, type TimelinePeriodProps } from '@navikt/ds-react';
import * as React from 'react';

import { PeriodeHandling } from './typer/periodeHandling';
import { useVilkårsvurdering } from './VilkårsvurderingContext';
import VilkårsvurderingPeriodeSkjema from './VilkårsvurderingPeriode/VilkårsvurderingPeriodeSkjema';
import { useBehandling } from '../../../context/BehandlingContext';
import { Vilkårsresultat } from '../../../kodeverk';
import { ClassNamePeriodeStatus } from '../../../typer/periodeSkjemaData';
import { FTAlertStripe, Navigering } from '../../Felleskomponenter/Flytelementer';
import { ModalWrapper } from '../../Felleskomponenter/Modal/ModalWrapper';
import TilbakeTidslinje from '../../Felleskomponenter/TilbakeTidslinje/TilbakeTidslinje';

const lagTidslinjeRader = (
    perioder: VilkårsvurderingPeriodeSkjemaData[],
    valgtPeriode: VilkårsvurderingPeriodeSkjemaData | undefined
): TimelinePeriodProps[][] => {
    return [
        perioder.map((periode, index): TimelinePeriodProps => {
            const erAktivPeriode =
                !!valgtPeriode &&
                periode.periode.fom === valgtPeriode.periode.fom &&
                periode.periode.tom === valgtPeriode.periode.tom;
            const classNamePeriodeStatus = finnClassNamePeriodeStatus(periode);
            let periodeStatus: 'danger' | 'info' | 'neutral' | 'success' | 'warning' = 'warning';
            if (classNamePeriodeStatus === ClassNamePeriodeStatus.Avvist) {
                periodeStatus = 'danger';
            } else if (classNamePeriodeStatus === ClassNamePeriodeStatus.Behandlet) {
                periodeStatus = 'success';
            }
            return {
                end: new Date(periode.periode.tom),
                start: new Date(periode.periode.fom),
                status: periodeStatus,
                isActive: erAktivPeriode,
                id: `index_${index}`,
                className: classNamePeriodeStatus,
            };
        }),
    ];
};

const finnClassNamePeriodeStatus = (periode: VilkårsvurderingPeriodeSkjemaData) => {
    const { vilkårsvurderingsresultatInfo } = periode;
    const { vilkårsvurderingsresultat } = vilkårsvurderingsresultatInfo || {};

    if (periode.foreldet) {
        return ClassNamePeriodeStatus.Avvist;
    }

    const erBehandlet =
        !!vilkårsvurderingsresultat &&
        vilkårsvurderingsresultat !== Vilkårsresultat.Udefinert &&
        !!periode.begrunnelse;
    return erBehandlet ? ClassNamePeriodeStatus.Behandlet : ClassNamePeriodeStatus.Ubehandlet;
};

interface IProps {
    behandling: IBehandling;
    fagsak: IFagsak;
    perioder: VilkårsvurderingPeriodeSkjemaData[];
    erTotalbeløpUnder4Rettsgebyr: boolean;
    erLesevisning: boolean;
}

const VilkårsvurderingPerioder: React.FC<IProps> = ({
    behandling,
    fagsak,
    perioder,
    erTotalbeløpUnder4Rettsgebyr,
    erLesevisning,
}) => {
    const {
        valgtPeriode,
        settValgtPeriode,
        behandletPerioder,
        valideringsFeilmelding,
        sendInnSkjemaOgNaviger,
        nestePeriode,
        forrigePeriode,
        gåTilForrigeSteg,
        gåTilNesteSteg,
        gåTilPeriode,
        sendInnSkjemaMutation,
    } = useVilkårsvurdering();
    const { harUlagredeData, nullstillIkkePersisterteKomponenter } = useBehandling();

    const [visUlagretDataModal, settVisUlagretDataModal] = React.useState(false);
    const [pendingPeriode, settPendingPeriode] = React.useState<
        VilkårsvurderingPeriodeSkjemaData | undefined
    >();

    // Ref for å få tilgang til validerOgOppdaterFelter fra barnkomponenten
    const validerOgOppdaterFelterRef = React.useRef<
        ((periode: VilkårsvurderingPeriodeSkjemaData) => boolean) | null
    >(null);

    const tidslinjeRader = lagTidslinjeRader(perioder, valgtPeriode);

    const onSelectPeriode = (periode: TimelinePeriodProps) => {
        const periodeFom = periode.start.toISOString().substring(0, 10);
        const periodeTom = periode.end.toISOString().substring(0, 10);
        const vilkårsvurderingPeriode = perioder.find(
            per => per.periode.fom === periodeFom && per.periode.tom === periodeTom
        );

        if (harUlagredeData && vilkårsvurderingPeriode !== valgtPeriode) {
            settPendingPeriode(vilkårsvurderingPeriode);
            settVisUlagretDataModal(true);
            return;
        }

        settValgtPeriode(vilkårsvurderingPeriode);
    };

    const handleNavigering = async (
        handling: PeriodeHandling,
        nyPeriode?: VilkårsvurderingPeriodeSkjemaData | undefined
    ): Promise<void> => {
        if (harUlagredeData) {
            if (!valgtPeriode || !validerOgOppdaterFelterRef.current?.(valgtPeriode)) return;
            await sendInnSkjemaOgNaviger();
        }

        const utførHandling = {
            [PeriodeHandling.GåTilForrigeSteg]: () => gåTilForrigeSteg(),
            [PeriodeHandling.GåTilNesteSteg]: () => gåTilNesteSteg(),
            [PeriodeHandling.GåTilPeriode]: () => nyPeriode && gåTilPeriode(nyPeriode),
            [PeriodeHandling.ForrigePeriode]: () => valgtPeriode && forrigePeriode(valgtPeriode),
            [PeriodeHandling.NestePeriode]: () => valgtPeriode && nestePeriode(valgtPeriode),
        }[handling];

        return utførHandling?.();
    };

    const handleForlatUtenÅLagre = () => {
        if (pendingPeriode) {
            nullstillIkkePersisterteKomponenter();
            settValgtPeriode(pendingPeriode);
        }
        settVisUlagretDataModal(false);
        settPendingPeriode(undefined);
    };

    const handleLagreOgBytt = async () => {
        settVisUlagretDataModal(false);
        await handleNavigering(PeriodeHandling.GåTilPeriode, pendingPeriode);
        settPendingPeriode(undefined);
    };

    const handleAvbryt = () => {
        settVisUlagretDataModal(false);
        settPendingPeriode(undefined);
    };

    const erFørstePeriode = valgtPeriode && valgtPeriode.index === perioder[0].index;
    const handleForrigeKnapp = async (): Promise<void> => {
        const handling = erFørstePeriode
            ? PeriodeHandling.GåTilForrigeSteg
            : PeriodeHandling.ForrigePeriode;
        return await handleNavigering(handling);
    };
    const hentForrigeKnappTekst = (): string => {
        if (erFørstePeriode) {
            return harUlagredeData
                ? 'Lagre og gå tilbake til foreldelse'
                : 'Gå tilbake til foreldelse';
        } else {
            return harUlagredeData
                ? 'Lagre og gå tilbake til forrige periode'
                : 'Gå tilbake til forrige periode';
        }
    };

    const erSistePeriode =
        valgtPeriode && valgtPeriode.index === perioder[perioder.length - 1].index;
    const handleNesteKnapp = async (): Promise<void> => {
        const handling = erSistePeriode
            ? PeriodeHandling.GåTilNesteSteg
            : PeriodeHandling.NestePeriode;
        return await handleNavigering(handling);
    };
    const hentNesteKnappTekst = (): string => {
        if (erSistePeriode) {
            return harUlagredeData ? 'Lagre og gå videre til vedtak' : 'Gå videre til vedtak';
        } else {
            return harUlagredeData
                ? 'Lagre og gå videre til neste periode'
                : 'Gå videre til neste periode';
        }
    };

    return perioder && tidslinjeRader ? (
        <>
            <VStack gap="5">
                {valideringsFeilmelding && (
                    <FTAlertStripe variant="error" fullWidth>
                        <BodyShort className="font-semibold">{valideringsFeilmelding}</BodyShort>
                    </FTAlertStripe>
                )}
                <TilbakeTidslinje rader={tidslinjeRader} onSelectPeriode={onSelectPeriode} />
                {valgtPeriode && (
                    <>
                        <VilkårsvurderingPeriodeSkjema
                            behandling={behandling}
                            periode={valgtPeriode}
                            behandletPerioder={behandletPerioder}
                            erTotalbeløpUnder4Rettsgebyr={erTotalbeløpUnder4Rettsgebyr}
                            erLesevisning={erLesevisning}
                            fagsak={fagsak}
                            perioder={perioder}
                            validerOgOppdaterFelterRef={validerOgOppdaterFelterRef}
                        />

                        {!erLesevisning && !valgtPeriode.foreldet && (
                            <Navigering>
                                <Button
                                    onClick={handleNesteKnapp}
                                    loading={sendInnSkjemaMutation.isPending}
                                >
                                    {hentNesteKnappTekst()}
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={handleForrigeKnapp}
                                    loading={sendInnSkjemaMutation.isPending}
                                >
                                    {hentForrigeKnappTekst()}
                                </Button>
                            </Navigering>
                        )}
                    </>
                )}
            </VStack>

            {visUlagretDataModal && (
                <ModalWrapper
                    tittel="Du har ikke lagret dine siste endringer og vil miste disse om du bytter periode"
                    visModal={true}
                    onClose={handleAvbryt}
                    aksjonsknapper={{
                        hovedKnapp: {
                            onClick: handleLagreOgBytt,
                            tekst: 'Lagre og bytt periode',
                        },
                        lukkKnapp: {
                            onClick: handleForlatUtenÅLagre,
                            tekst: 'Bytt uten å lagre',
                        },
                        marginTop: 4,
                    }}
                />
            )}
        </>
    ) : null;
};

export default VilkårsvurderingPerioder;
