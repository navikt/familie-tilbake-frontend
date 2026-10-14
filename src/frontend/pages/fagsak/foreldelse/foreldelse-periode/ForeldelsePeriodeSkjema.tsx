import type { ForeldelsesvurderingstypeEnum } from '@/generated';
import type { ForeldelsePeriodeSkjemeData } from '../typer/foreldelse';

import { Button, Heading, HStack, Radio, RadioGroup, Textarea, VStack } from '@navikt/ds-react';
import { differenceInMonths, parseISO } from 'date-fns';
import { type FC, useEffect } from 'react';

import { useBehandling } from '@/context/BehandlingContext';
import { useBehandlingState } from '@/context/BehandlingStateContext';
import { Valideringsstatus } from '@/hooks/skjema/typer';
import { Datovelger } from '@/komponenter/datovelger/Datovelger';
import { PeriodeOppsummering } from '@/komponenter/periodeinformasjon/PeriodeOppsummering';
import { useForeldelse } from '@/pages/fagsak/foreldelse/ForeldelseContext';
import { isoStringTilDate } from '@/utils/dato';

import { useForeldelsePeriodeSkjema } from './ForeldelsePeriodeSkjemaContext';
import { SplittPeriode } from './splitt-periode/SplittPeriode';

type Props = {
    periode: ForeldelsePeriodeSkjemeData;
};

export const ForeldelsePeriodeSkjema: FC<Props> = ({ periode }: Props) => {
    const { erNyModell } = useBehandling();
    const { erAutoutført, oppdaterPeriode, onSplitPeriode } = useForeldelse();
    const { skjema, onBekreft } = useForeldelsePeriodeSkjema(
        (oppdatertPeriode: ForeldelsePeriodeSkjemeData) => oppdaterPeriode(oppdatertPeriode)
    );
    const { behandlingILesemodus, setIkkePersistertKomponent } = useBehandlingState();
    const erLesevisning = behandlingILesemodus || !!erAutoutført;

    // biome-ignore lint/correctness/useExhaustiveDependencies: Se på om dette er en bug eller tiltenkt funksjonalitet. Vurder useEffectEvent senere.
    useEffect(() => {
        skjema.felter.begrunnelse.onChange(periode?.begrunnelse || '');
        const foreldelsesvurderingstype = periode?.foreldelsesvurderingstype;
        const vurderingstype =
            foreldelsesvurderingstype === 'AUTOMATISK_VURDERT_IKKE_FORELDET'
                ? 'IKKE_FORELDET'
                : foreldelsesvurderingstype || '';
        skjema.felter.foreldelsesvurderingstype.onChange(vurderingstype);
        skjema.felter.foreldelsesfrist.onChange(
            periode?.foreldelsesfrist ? isoStringTilDate(periode.foreldelsesfrist) : undefined
        );
        skjema.felter.oppdagelsesdato.onChange(
            periode?.oppdagelsesdato ? isoStringTilDate(periode.oppdagelsesdato) : undefined
        );
    }, [periode]);

    const erForeldet = skjema.felter.foreldelsesvurderingstype.verdi === 'FORELDET';
    const erMedTilleggsfrist = skjema.felter.foreldelsesvurderingstype.verdi === 'TILLEGGSFRIST';

    const ugyldigVurderingValgt =
        skjema.visFeilmeldinger &&
        skjema.felter.foreldelsesvurderingstype.valideringsstatus === Valideringsstatus.Feil;

    const ugyldigForeldelsesfristValgt =
        skjema.visFeilmeldinger &&
        skjema.felter.foreldelsesfrist.valideringsstatus === Valideringsstatus.Feil;

    const ugyldigOppdagelsesdatoValgt =
        skjema.visFeilmeldinger &&
        skjema.felter.oppdagelsesdato.valideringsstatus === Valideringsstatus.Feil;

    const kanSplittePeriode = (periode: ForeldelsePeriodeSkjemeData): boolean => {
        const fom = parseISO(periode.periode.fom);
        const tom = parseISO(periode.periode.tom);
        return differenceInMonths(tom, fom) >= 1;
    };

    return (
        <>
            <VStack gap="space-24">
                <HStack justify="space-between">
                    <Heading size="small" level="2">
                        Detaljer for valgt periode
                    </Heading>

                    {!erNyModell && !erLesevisning && kanSplittePeriode(periode) && (
                        <SplittPeriode periode={periode} onBekreft={onSplitPeriode} />
                    )}
                </HStack>

                <PeriodeOppsummering
                    fom={periode.periode.fom}
                    tom={periode.periode.tom}
                    beløp={periode.feilutbetaltBeløp}
                />
            </VStack>
            <VStack gap="space-24" className="max-w-xl">
                <RadioGroup
                    id="foreldet"
                    readOnly={erLesevisning}
                    size="small"
                    legend="Er perioden foreldet?"
                    value={skjema.felter.foreldelsesvurderingstype.verdi}
                    error={
                        ugyldigVurderingValgt
                            ? skjema.felter.foreldelsesvurderingstype.feilmelding?.toString()
                            : ''
                    }
                    onChange={(val: ForeldelsesvurderingstypeEnum): void => {
                        skjema.felter.foreldelsesvurderingstype.validerOgSettFelt(val);
                        setIkkePersistertKomponent('foreldelse');
                    }}
                >
                    <Radio key="IKKE_FORELDET" name="foreldet" value="IKKE_FORELDET">
                        Nei, perioden er ikke foreldet
                    </Radio>
                    <Radio key="FORELDET" name="foreldet" value="FORELDET">
                        Ja, perioden er foreldet
                    </Radio>
                    <Radio key="TILLEGGSFRIST" name="foreldet" value="TILLEGGSFRIST">
                        Nei, perioden er ikke foreldet. Tilleggsfristen på 10 år gjelder
                    </Radio>
                </RadioGroup>
                <Textarea
                    {...skjema.felter.begrunnelse.hentNavInputProps(skjema.visFeilmeldinger)}
                    id="begrunnelse"
                    name="begrunnelse"
                    label="Begrunn valget over"
                    size="small"
                    maxLength={3000}
                    minRows={3}
                    readOnly={erLesevisning}
                    value={skjema.felter.begrunnelse.verdi}
                    onChange={(event: React.ChangeEvent<HTMLTextAreaElement>): void => {
                        skjema.felter.begrunnelse.validerOgSettFelt(event.target.value);
                        setIkkePersistertKomponent('foreldelse');
                    }}
                />

                <>
                    {erMedTilleggsfrist && (
                        <Datovelger
                            felt={skjema.felter.oppdagelsesdato}
                            label="Når fikk Nav kunnskap om feilutbetalingen, eller når burde Nav ha fått slik kunnskap?"
                            description="Datoen brukes til å vurdere når tilleggsfristen begynner å løpe og kommer i vedtaksbrevet"
                            visFeilmeldinger={ugyldigOppdagelsesdatoValgt}
                            readOnly={erLesevisning}
                            kanKunVelgeFortid
                            settIkkePersistertKomponent={(): void =>
                                setIkkePersistertKomponent('foreldelse')
                            }
                        />
                    )}
                    {(erForeldet || erMedTilleggsfrist) && (
                        <Datovelger
                            felt={skjema.felter.foreldelsesfrist}
                            label="Foreldelsesfrist"
                            description={
                                erMedTilleggsfrist
                                    ? 'Sett fristen ett år frem i tid fra det tidspunktet Nav fikk eller burde fått kunnskap om feilutbetalingen'
                                    : 'Foreldelsesfristen settes minimum seks uker frem i tid fra vedtakstidspunktet. Dette skyldes at Skatteetaten må ha tid for å sette igang fristavbrytende tiltak'
                            }
                            visFeilmeldinger={ugyldigForeldelsesfristValgt}
                            readOnly={erLesevisning}
                            settIkkePersistertKomponent={(): void =>
                                setIkkePersistertKomponent('foreldelse')
                            }
                        />
                    )}
                </>

                {!erLesevisning && (
                    <div className="flex justify-start">
                        <Button
                            size="small"
                            className="w-40"
                            onClick={(): void => onBekreft(periode)}
                        >
                            Bekreft periode
                        </Button>
                    </div>
                )}
            </VStack>
        </>
    );
};
