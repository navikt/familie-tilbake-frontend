import type { VilkårsvurderingPeriodeSkjemaData } from './typer/feilutbetalingVilkårsvurdering';
import type { IBehandling } from '../../../typer/behandling';
import type { IFagsak } from '../../../typer/fagsak';
import type { TimelinePeriodProps } from '@navikt/ds-react';

import { BodyShort, VStack } from '@navikt/ds-react';
import * as React from 'react';
import { useState } from 'react';

import { PeriodeHandling } from './typer/periodeHandling';
import { useVilkårsvurdering } from './VilkårsvurderingContext';
import VilkårsvurderingPeriodeSkjema from './VilkårsvurderingPeriode/VilkårsvurderingPeriodeSkjema';
import { useVilkårsvurderingPeriodeSkjema } from './VilkårsvurderingPeriode/VilkårsvurderingPeriodeSkjemaContext';
import { useBehandling } from '../../../context/BehandlingContext';
import { Vilkårsresultat } from '../../../kodeverk';
import { ClassNamePeriodeStatus } from '../../../typer/periodeSkjemaData';
import { FTAlertStripe } from '../../Felleskomponenter/Flytelementer';
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
            const periodeStatus =
                classNamePeriodeStatus === ClassNamePeriodeStatus.Avvist
                    ? 'danger'
                    : classNamePeriodeStatus === ClassNamePeriodeStatus.Behandlet
                      ? 'success'
                      : 'warning';
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
        oppdaterPeriode,
    } = useVilkårsvurdering();
    const { harUlagredeData, nullstillIkkePersisterteKomponenter } = useBehandling();

    const { validerOgOppdaterFelter } = useVilkårsvurderingPeriodeSkjema(
        (oppdatertPeriode: VilkårsvurderingPeriodeSkjemaData) => {
            oppdaterPeriode(oppdatertPeriode);
        }
    );

    const [visModal, setVisModal] = useState(false);
    const [pendingPeriode, setPendingPeriode] = useState<
        VilkårsvurderingPeriodeSkjemaData | undefined
    >();

    const tidslinjeRader = lagTidslinjeRader(perioder, valgtPeriode);

    const onSelectPeriode = (periode: TimelinePeriodProps) => {
        const periodeFom = periode.start.toISOString().substring(0, 10);
        const periodeTom = periode.end.toISOString().substring(0, 10);
        const vilkårsvurderingPeriode = perioder.find(
            per => per.periode.fom === periodeFom && per.periode.tom === periodeTom
        );

        if (harUlagredeData && vilkårsvurderingPeriode !== valgtPeriode) {
            setPendingPeriode(vilkårsvurderingPeriode);
            setVisModal(true);
            return;
        }

        settValgtPeriode(vilkårsvurderingPeriode);
    };

    const handleForlatUtenÅLagre = () => {
        if (pendingPeriode) {
            nullstillIkkePersisterteKomponenter();
            settValgtPeriode(pendingPeriode);
        }
        setVisModal(false);
        setPendingPeriode(undefined);
    };

    const handleLagreOgBytt = async () => {
        try {
            if (!pendingPeriode) return;
            if (!validerOgOppdaterFelter(pendingPeriode)) return;

            await sendInnSkjemaOgNaviger(PeriodeHandling.GåTilNesteSteg);

            if (pendingPeriode) {
                settValgtPeriode(pendingPeriode);
            }
            setVisModal(false);
            setPendingPeriode(undefined);
        } catch (error) {
            console.error('Failed to save:', error);
        } finally {
            setVisModal(false);
        }
    };

    const handleAvbryt = () => {
        setVisModal(false);
        setPendingPeriode(undefined);
    };

    return perioder && tidslinjeRader ? (
        <VStack gap="5">
            {valideringsFeilmelding && (
                <FTAlertStripe variant="error" fullWidth>
                    <BodyShort className="font-semibold">{valideringsFeilmelding}</BodyShort>
                </FTAlertStripe>
            )}
            <TilbakeTidslinje rader={tidslinjeRader} onSelectPeriode={onSelectPeriode} />
            {valgtPeriode && (
                <VilkårsvurderingPeriodeSkjema
                    behandling={behandling}
                    periode={valgtPeriode}
                    behandletPerioder={behandletPerioder}
                    erTotalbeløpUnder4Rettsgebyr={erTotalbeløpUnder4Rettsgebyr}
                    erLesevisning={erLesevisning}
                    fagsak={fagsak}
                    perioder={perioder}
                />
            )}

            <ModalWrapper
                tittel="Du har ulagrede endringer"
                visModal={visModal}
                onClose={handleAvbryt}
                aksjonsknapper={{
                    hovedKnapp: {
                        onClick: handleLagreOgBytt,
                        tekst: 'Lagre og bytt periode',
                    },
                    lukkKnapp: {
                        onClick: handleForlatUtenÅLagre,
                        tekst: 'Bytt periode uten å lagre',
                    },
                    marginTop: 4,
                }}
            >
                <BodyShort>
                    Vil du lagre endringene dine før du bytter til en annen periode, eller vil du
                    forkaste dem?
                </BodyShort>
            </ModalWrapper>
        </VStack>
    ) : null;
};

export default VilkårsvurderingPerioder;
