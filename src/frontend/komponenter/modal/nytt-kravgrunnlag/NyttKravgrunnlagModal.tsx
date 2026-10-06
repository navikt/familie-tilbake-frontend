import type { FC } from 'react';
import type { EndretKravgrunnlag } from '@/generated';
import type {
    EndretPeriode,
    FjernetPeriode,
    KravgrunnlagForskjell,
    NyPeriode,
} from '@/generated-new';

import { ArrowRightIcon } from '@navikt/aksel-icons';
import {
    Alert,
    BodyLong,
    BodyShort,
    Box,
    Button,
    Heading,
    HGrid,
    HStack,
    Loader,
    Modal,
    Tag,
    VStack,
} from '@navikt/ds-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { add, addDays, format, intervalToDuration, parseISO } from 'date-fns';
import { Fragment, useEffect } from 'react';

import { useBehandling } from '@/context/BehandlingContext';
import { hentBehandlingQueryKey } from '@/generated/@tanstack/react-query.gen';
import {
    behandlingBenyttNyesteKravgrunnlagMutation,
    behandlingFaktaOptions,
    behandlingFaktaQueryKey,
} from '@/generated-new/@tanstack/react-query.gen';
import { formatCurrencyNoKr, formatterDatostring, hentPeriodelengde } from '@/utils';
import { MODAL_BREDDE } from '@/utils/modalUtils';

const hentVarighetsendring = (periode: EndretPeriode): string | null => {
    // Sammenlign kalenderlengdene fra samme startdato for å bevare hele måneder og år.
    const fellesStart = parseISO('2000-01-01');
    const gammelSlutt = add(
        fellesStart,
        intervalToDuration({
            start: parseISO(periode.gammelPeriode.fom),
            end: addDays(parseISO(periode.gammelPeriode.tom), 1),
        })
    );
    const nySlutt = add(
        fellesStart,
        intervalToDuration({
            start: parseISO(periode.fom),
            end: addDays(parseISO(periode.tom), 1),
        })
    );
    if (gammelSlutt.getTime() === nySlutt.getTime()) {
        return null;
    }
    const erKortere = nySlutt < gammelSlutt;
    const start = erKortere ? nySlutt : gammelSlutt;
    const slutt = erKortere ? gammelSlutt : nySlutt;
    const endring = hentPeriodelengde(
        format(start, 'yyyy-MM-dd'),
        format(addDays(slutt, -1), 'yyyy-MM-dd')
    );
    return `${erKortere ? '–' : '+'}${endring}`;
};

type PeriodeKortProps = {
    perioder: NyPeriode[] | FjernetPeriode[];
    type: 'lagtTil' | 'fjernet' | 'uendret';
};

const PeriodeKort: FC<PeriodeKortProps> = ({ perioder, type }: PeriodeKortProps) => {
    const kortUtseende = {
        lagtTil: {
            farge: 'success',
            bakgrunn: 'success-moderate',
            tekstfarge: 'text-ax-text-success',
            tittel: 'Lagt til',
        },
        fjernet: {
            farge: 'warning',
            bakgrunn: 'warning-moderate',
            tekstfarge: 'text-ax-text-warning',
            tittel: 'Fjernet',
        },
        uendret: {
            farge: 'neutral-subtle',
            bakgrunn: 'neutral-moderate',
            tekstfarge: 'text-ax-text-neutral',
            tittel: 'Ingen endringer',
        },
    } as const;
    const { farge, bakgrunn, tekstfarge, tittel } = kortUtseende[type];

    return (
        <Box
            as="section"
            aria-label={tittel}
            borderColor={farge}
            borderWidth="1"
            borderRadius="12"
            overflow="hidden"
        >
            <Box
                background={bakgrunn}
                borderColor={farge}
                borderWidth="0 0 1 0"
                paddingInline="space-16"
                paddingBlock="space-6"
            >
                <Heading level="2" size="xsmall" className={tekstfarge}>
                    {tittel}
                </Heading>
            </Box>
            <VStack
                gap="space-8"
                paddingInline="space-16"
                paddingBlock="space-8 space-12"
                className="bg-ax-bg-default"
            >
                <HGrid columns="1fr 1fr" gap="space-32">
                    <BodyShort weight="semibold">Periode</BodyShort>
                    <BodyShort weight="semibold">Feilutbetalt</BodyShort>
                </HGrid>
                {perioder.map((periode, indeks) => {
                    const periodelengde = hentPeriodelengde(periode.fom, periode.tom);
                    return (
                        <Fragment key={`${periode.fom}-${periode.tom}`}>
                            {indeks > 0 && <hr className="border-ax-border-neutral-subtle" />}
                            <HGrid columns="1fr 1fr" gap="space-32">
                                <VStack gap="space-8">
                                    <BodyShort>
                                        {formatterDatostring(periode.fom)}–
                                        {formatterDatostring(periode.tom)}
                                    </BodyShort>
                                    {periodelengde && (
                                        <BodyShort size="small">{periodelengde}</BodyShort>
                                    )}
                                </VStack>
                                <BodyShort className="text-ax-text-brand-magenta">
                                    {formatCurrencyNoKr(periode.beløp)}
                                </BodyShort>
                            </HGrid>
                        </Fragment>
                    );
                })}
            </VStack>
        </Box>
    );
};

type EndretPeriodeKortProps = {
    periode: EndretPeriode;
};

const EndretPeriodeKort: FC<EndretPeriodeKortProps> = ({ periode }: EndretPeriodeKortProps) => {
    const gammelPeriodelengde = hentPeriodelengde(
        periode.gammelPeriode.fom,
        periode.gammelPeriode.tom
    );
    const nyPeriodelengde = hentPeriodelengde(periode.fom, periode.tom);
    const varighetsendring = hentVarighetsendring(periode);
    const beløpsendring = periode.nyttBeløp - periode.gammeltBeløp;

    return (
        <Box
            as="section"
            aria-label="Endringer"
            borderColor="info"
            borderWidth="1"
            borderRadius="12"
            overflow="hidden"
        >
            <Box
                background="info-moderate"
                borderColor="info"
                borderWidth="0 0 1 0"
                paddingInline="space-16"
                paddingBlock="space-6"
            >
                <Heading level="2" size="xsmall" className="text-ax-text-info">
                    Endringer
                </Heading>
            </Box>
            <HGrid
                columns="1fr auto 1fr"
                gap="space-16"
                align="center"
                paddingInline="space-16"
                paddingBlock="space-8 space-12"
                className="bg-ax-bg-default"
            >
                <VStack gap="space-8" className="min-w-0">
                    <BodyShort weight="semibold">Før</BodyShort>
                    <BodyShort>
                        {formatterDatostring(periode.gammelPeriode.fom)}–
                        {formatterDatostring(periode.gammelPeriode.tom)}
                    </BodyShort>
                    {gammelPeriodelengde && <BodyShort>{gammelPeriodelengde}</BodyShort>}
                    <BodyShort className="text-ax-text-brand-magenta">
                        {formatCurrencyNoKr(periode.gammeltBeløp)} kr
                    </BodyShort>
                </VStack>
                <ArrowRightIcon aria-hidden fontSize="1.5rem" />
                <VStack gap="space-8" className="min-w-0">
                    <BodyShort weight="semibold">Etter endring</BodyShort>
                    <BodyShort>
                        {formatterDatostring(periode.fom)}–{formatterDatostring(periode.tom)}
                    </BodyShort>
                    {nyPeriodelengde && (
                        <HStack gap="space-8" align="center">
                            <BodyShort>{nyPeriodelengde}</BodyShort>
                            {varighetsendring && (
                                <Tag
                                    variant="moderate"
                                    data-color={
                                        varighetsendring.startsWith('–') ? 'danger' : 'success'
                                    }
                                    size="small"
                                >
                                    {varighetsendring}
                                </Tag>
                            )}
                        </HStack>
                    )}
                    <HStack gap="space-8" align="center">
                        <BodyShort className="text-ax-text-brand-magenta">
                            {formatCurrencyNoKr(periode.nyttBeløp)} kr
                        </BodyShort>
                        {beløpsendring !== 0 && (
                            <Tag
                                variant="moderate"
                                data-color={beløpsendring < 0 ? 'danger' : 'success'}
                                size="small"
                            >
                                {beløpsendring > 0 ? '+' : '–'}
                                {formatCurrencyNoKr(Math.abs(beløpsendring))} kr
                            </Tag>
                        )}
                    </HStack>
                </VStack>
            </HGrid>
        </Box>
    );
};

type Props = {
    endretKravgrunnlag: Omit<EndretKravgrunnlag, 'endringer'> & {
        endringer: EndretKravgrunnlag['endringer'] | KravgrunnlagForskjell[];
    };
    onFullført: () => void;
};

type ModalTekst = {
    tittel: string;
    beskrivelse: string;
};

const periodeFrase = (antall: number, erNyPeriode: boolean = false): string =>
    antall === 1
        ? `en ${erNyPeriode ? 'ny ' : ''}periode`
        : `flere ${erNyPeriode ? 'nye ' : ''}perioder`;

const hentModalTekst = (
    antallNyePerioder: number,
    antallEndredePerioder: number,
    antallFjernedePerioder: number
): ModalTekst => {
    const harNyePerioder = antallNyePerioder > 0;
    const harEndretPerioder = antallEndredePerioder > 0;
    const harFjernedePerioder = antallFjernedePerioder > 0;

    if (harFjernedePerioder && !harNyePerioder && !harEndretPerioder) {
        return {
            tittel:
                antallFjernedePerioder > 1 ? 'Flere perioder er fjernet' : 'En periode er fjernet',
            beskrivelse: `Det er registrert at ${periodeFrase(antallFjernedePerioder)} er fjernet i kravgrunnlaget, og du må vurdere på nytt.`,
        };
    }
    if (harNyePerioder && !harFjernedePerioder && !harEndretPerioder) {
        return {
            tittel: antallNyePerioder > 1 ? 'Nye perioder må vurderes' : 'Ny periode må vurderes',
            beskrivelse: `Det er registrert ${periodeFrase(antallNyePerioder, true)} i kravgrunnlaget som må vurderes.`,
        };
    }
    return {
        tittel: 'Endringer i kravgrunnlaget',
        beskrivelse: 'Det er registrert endringer i kravgrunnlaget som må vurderes på nytt.',
    };
};

export const NyttKravgrunnlagModal: FC<Props> = ({ endretKravgrunnlag, onFullført }: Props) => {
    const { behandlingId, erNyModell } = useBehandling();
    const queryClient = useQueryClient();
    const fakta = useQuery({
        ...behandlingFaktaOptions({ path: { behandlingId } }),
        enabled: erNyModell,
    });

    const endringer = endretKravgrunnlag.endringer;
    const fjernedePerioder = endringer.filter(endring => endring.type === 'fjernet_periode');
    const nyePerioder = endringer.filter(endring => endring.type === 'ny_periode');
    const endretPerioder = endringer.filter(endring => endring.type === 'endret_periode');
    const uendredePerioder = fakta.data?.perioder
        .filter(
            periode =>
                !periode.endringIKravgrunnlag &&
                !periode.splittbarePerioder.some(delperiode => delperiode.endringIKravgrunnlag) &&
                !endringer.some(
                    endring =>
                        (periode.fom <= endring.tom && periode.tom >= endring.fom) ||
                        ('gammelPeriode' in endring &&
                            periode.fom <= endring.gammelPeriode.tom &&
                            periode.tom >= endring.gammelPeriode.fom)
                )
        )
        .map(periode => ({
            fom: periode.fom,
            tom: periode.tom,
            beløp: periode.feilutbetaltBeløp,
        }));

    const { tittel, beskrivelse } = hentModalTekst(
        nyePerioder.length,
        endretPerioder.length,
        fjernedePerioder.length
    );

    // Chrome fyrer ikke alltid dialogens cancel-event, så vi blokkerer selve Escape-lukkingen
    useEffect(() => {
        const blokkerEscape = (event: KeyboardEvent): void => {
            if (event.key === 'Escape') {
                event.preventDefault();
            }
        };
        document.addEventListener('keydown', blokkerEscape, true);
        return (): void => document.removeEventListener('keydown', blokkerEscape, true);
    }, []);

    const benyttNyesteKravgrunnlag = useMutation({
        ...behandlingBenyttNyesteKravgrunnlagMutation(),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: hentBehandlingQueryKey({ path: { behandlingId } }),
            });
            await queryClient.invalidateQueries({
                queryKey: behandlingFaktaQueryKey({ path: { behandlingId } }),
            });
            onFullført();
        },
    });

    const startVurdering = (): void => {
        benyttNyesteKravgrunnlag.mutate({ path: { behandlingId } });
    };

    return (
        <Modal
            open
            onClose={(): void => undefined}
            onBeforeClose={(): boolean => false}
            header={{
                heading: tittel,
                size: 'medium',
                closeButton: false,
            }}
            portal
            className={MODAL_BREDDE}
        >
            <Modal.Body>
                <VStack gap="space-16">
                    <BodyLong>{beskrivelse}</BodyLong>
                    {fjernedePerioder.length > 0 && (
                        <PeriodeKort perioder={fjernedePerioder} type="fjernet" />
                    )}
                    {nyePerioder.length > 0 && (
                        <PeriodeKort perioder={nyePerioder} type="lagtTil" />
                    )}
                    {endretPerioder.map(periode => (
                        <EndretPeriodeKort
                            key={`${periode.fom}-${periode.tom}`}
                            periode={periode}
                        />
                    ))}
                    {erNyModell && fakta.isPending && (
                        <Loader title="Henter øvrige perioder i kravgrunnlaget" />
                    )}
                    {erNyModell && fakta.isError && (
                        <Alert variant="error" size="small">
                            Kunne ikke hente øvrige perioder i kravgrunnlaget.
                            <Button
                                variant="tertiary"
                                size="small"
                                onClick={(): void => {
                                    void fakta.refetch();
                                }}
                                loading={fakta.isFetching}
                            >
                                Prøv igjen
                            </Button>
                        </Alert>
                    )}
                    {uendredePerioder && uendredePerioder.length > 0 && (
                        <PeriodeKort perioder={uendredePerioder} type="uendret" />
                    )}
                    {benyttNyesteKravgrunnlag.isError && (
                        <Alert variant="error" size="small">
                            Kunne ikke ta i bruk det nye kravgrunnlaget. Prøv igjen.
                        </Alert>
                    )}
                </VStack>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    size="small"
                    onClick={startVurdering}
                    loading={benyttNyesteKravgrunnlag.isPending}
                >
                    Start vurderingen
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
