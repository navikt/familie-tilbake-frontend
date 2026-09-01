import type { FC } from 'react';
import type {
    EndretKravgrunnlag,
    EndretPeriodeDto,
    FjernetPeriodeDto,
    NyPeriodeDto,
} from '@/generated';

import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon } from '@navikt/aksel-icons';
import {
    Alert,
    BodyLong,
    BodyShort,
    Box,
    Button,
    Heading,
    HStack,
    Modal,
    Tag,
    VStack,
} from '@navikt/ds-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useBehandling } from '@/context/BehandlingContext';
import { hentBehandlingQueryKey } from '@/generated/@tanstack/react-query.gen';
import {
    behandlingBenyttNyesteKravgrunnlagMutation,
    behandlingFaktaQueryKey,
} from '@/generated-new/@tanstack/react-query.gen';
import { MODAL_BREDDE } from '@/komponenter/meny/utils';
import { formatCurrencyNoKr, formatterDatostring, hentPeriodelengde } from '@/utils';

const periodensVarighet = (fom: string, tom: string): number => Date.parse(tom) - Date.parse(fom);

type FjernetPeriodeKortProps = {
    periode: FjernetPeriodeDto;
};

const FjernetPeriodeKort: FC<FjernetPeriodeKortProps> = ({ periode }: FjernetPeriodeKortProps) => {
    const periodelengde = hentPeriodelengde(periode.fom, periode.tom);
    return (
        <Box borderColor="warning" borderWidth="1" borderRadius="12" overflow="hidden">
            <Box
                background="warning-moderate"
                borderColor="warning"
                borderWidth="0 0 1 0"
                paddingInline="space-16"
                paddingBlock="space-6"
            >
                <Heading level="2" size="xsmall" className="text-ax-text-warning">
                    Detaljer om perioden som er fjernet
                </Heading>
            </Box>
            <HStack
                gap="space-32"
                paddingInline="space-16"
                paddingBlock="space-8 space-12"
                className="bg-ax-bg-default"
            >
                <VStack gap="space-8">
                    <BodyShort weight="semibold">Periode</BodyShort>
                    <VStack>
                        <BodyShort>
                            {formatterDatostring(periode.fom)}–{formatterDatostring(periode.tom)}
                        </BodyShort>
                        {periodelengde && <BodyShort size="small">{periodelengde}</BodyShort>}
                    </VStack>
                </VStack>
                <VStack gap="space-8">
                    <BodyShort weight="semibold">Feilutbetalt</BodyShort>
                    <BodyShort className="text-ax-text-brand-magenta">
                        {formatCurrencyNoKr(periode.beløp)}
                    </BodyShort>
                </VStack>
            </HStack>
        </Box>
    );
};

type NyPeriodeKortProps = {
    periode: NyPeriodeDto;
};

const NyPeriodeKort: FC<NyPeriodeKortProps> = ({ periode }: NyPeriodeKortProps) => {
    const periodelengde = hentPeriodelengde(periode.fom, periode.tom);
    return (
        <Box borderColor="success" borderWidth="1" borderRadius="12" overflow="hidden">
            <Box
                background="success-moderate"
                borderColor="success"
                borderWidth="0 0 1 0"
                paddingInline="space-16"
                paddingBlock="space-6"
            >
                <Heading level="2" size="xsmall" className="text-ax-text-success">
                    Detaljer om den nye perioden
                </Heading>
            </Box>
            <HStack
                gap="space-32"
                paddingInline="space-16"
                paddingBlock="space-8 space-12"
                className="bg-ax-bg-default"
            >
                <VStack gap="space-8">
                    <BodyShort weight="semibold">Periode</BodyShort>
                    <VStack>
                        <BodyShort>
                            {formatterDatostring(periode.fom)}–{formatterDatostring(periode.tom)}
                        </BodyShort>
                        {periodelengde && <BodyShort size="small">{periodelengde}</BodyShort>}
                    </VStack>
                </VStack>
                <VStack gap="space-8">
                    <BodyShort weight="semibold">Feilutbetalt</BodyShort>
                    <BodyShort className="text-ax-text-brand-magenta">
                        {formatCurrencyNoKr(periode.beløp)}
                    </BodyShort>
                </VStack>
            </HStack>
        </Box>
    );
};

type EndretPeriodeKortProps = {
    periode: EndretPeriodeDto;
};

const EndretPeriodeKort: FC<EndretPeriodeKortProps> = ({ periode }: EndretPeriodeKortProps) => {
    const gammelPeriodelengde = hentPeriodelengde(
        periode.gammelPeriode.fom,
        periode.gammelPeriode.tom
    );
    const nyPeriodelengde = hentPeriodelengde(periode.fom, periode.tom);
    const nyPeriodeErKortere =
        periodensVarighet(periode.fom, periode.tom) <
        periodensVarighet(periode.gammelPeriode.fom, periode.gammelPeriode.tom);
    const nyttBeløpErMindre = periode.nyttBeløp < periode.gammeltBeløp;
    const periodeErEndret =
        periode.gammelPeriode.fom !== periode.fom || periode.gammelPeriode.tom !== periode.tom;
    const beløpErEndret = periode.gammeltBeløp !== periode.nyttBeløp;

    return (
        <Box borderColor="info" borderWidth="1" borderRadius="12" overflow="hidden">
            <Box
                background="info-moderate"
                borderColor="info"
                borderWidth="0 0 1 0"
                paddingInline="space-16"
                paddingBlock="space-6"
            >
                <Heading level="2" size="xsmall" className="text-ax-text-info">
                    Detaljer om endringer i den eksisterende perioden
                </Heading>
            </Box>
            <VStack
                gap="space-24"
                paddingInline="space-16"
                paddingBlock="space-8 space-12"
                className="bg-ax-bg-default"
            >
                <VStack gap="space-8">
                    <BodyShort weight="semibold">Periode</BodyShort>
                    {periodeErEndret ? (
                        <HStack gap="space-16" align="center" wrap={false}>
                            <VStack align="start">
                                <BodyShort>
                                    {formatterDatostring(periode.gammelPeriode.fom)}–
                                    {formatterDatostring(periode.gammelPeriode.tom)}
                                </BodyShort>
                                {gammelPeriodelengde && (
                                    <Tag variant="moderate" data-color="danger" size="small">
                                        {gammelPeriodelengde}
                                    </Tag>
                                )}
                            </VStack>
                            <ArrowRightIcon
                                aria-label="endres til"
                                fontSize="1.5rem"
                                className="shrink-0"
                            />
                            <VStack align="start">
                                <BodyShort>
                                    {formatterDatostring(periode.fom)}–
                                    {formatterDatostring(periode.tom)}
                                </BodyShort>
                                {nyPeriodelengde && (
                                    <Tag
                                        variant="moderate"
                                        data-color="success"
                                        size="small"
                                        icon={
                                            nyPeriodeErKortere ? (
                                                <ArrowDownIcon aria-hidden />
                                            ) : (
                                                <ArrowUpIcon aria-hidden />
                                            )
                                        }
                                    >
                                        {nyPeriodelengde}
                                    </Tag>
                                )}
                            </VStack>
                        </HStack>
                    ) : (
                        <VStack align="start">
                            <BodyShort>
                                {formatterDatostring(periode.fom)}–
                                {formatterDatostring(periode.tom)}
                            </BodyShort>
                            {nyPeriodelengde && (
                                <BodyShort size="small">{nyPeriodelengde}</BodyShort>
                            )}
                        </VStack>
                    )}
                </VStack>
                <VStack gap="space-8">
                    <BodyShort weight="semibold">Feilutbetalt</BodyShort>
                    {beløpErEndret ? (
                        <HStack gap="space-16" align="center" wrap={false}>
                            <Tag variant="moderate" data-color="danger" size="small">
                                {formatCurrencyNoKr(periode.gammeltBeløp)}
                            </Tag>
                            <ArrowRightIcon
                                aria-label="endres til"
                                fontSize="1.5rem"
                                className="shrink-0"
                            />
                            <Tag
                                variant="moderate"
                                data-color="success"
                                size="small"
                                icon={
                                    nyttBeløpErMindre ? (
                                        <ArrowDownIcon aria-hidden />
                                    ) : (
                                        <ArrowUpIcon aria-hidden />
                                    )
                                }
                            >
                                {formatCurrencyNoKr(periode.nyttBeløp)}
                            </Tag>
                        </HStack>
                    ) : (
                        <BodyShort className="text-ax-text-brand-magenta">
                            {formatCurrencyNoKr(periode.nyttBeløp)}
                        </BodyShort>
                    )}
                </VStack>
            </VStack>
        </Box>
    );
};

type Props = {
    endretKravgrunnlag: EndretKravgrunnlag;
    onFullført: () => void;
};

type ModalTekst = {
    tittel: string;
    beskrivelse: string;
};

const periodeOrd = (antall: number): string => (antall === 1 ? 'periode' : 'perioder');

const periodeFrase = (antall: number): string => `${antall} ${periodeOrd(antall)}`;

const hentModalTekst = (
    antallNyePerioder: number,
    antallEndredePerioder: number,
    antallFjernedePerioder: number
): ModalTekst => {
    const harNyePerioder = antallNyePerioder > 0;
    const harEndretPerioder = antallEndredePerioder > 0;
    const harFjernedePerioder = antallFjernedePerioder > 0;
    const antallBerørtePerioder =
        antallNyePerioder + antallEndredePerioder + antallFjernedePerioder;
    const tittelPerioder = antallBerørtePerioder === 1 ? 'perioden' : 'periodene';

    if (harFjernedePerioder && harNyePerioder && harEndretPerioder) {
        return {
            tittel: `Endringer i ${tittelPerioder}`,
            beskrivelse: `Det er registrert at ${periodeFrase(antallFjernedePerioder)} er fjernet, ${periodeFrase(antallNyePerioder)} er lagt til og endringer i ${periodeFrase(antallEndredePerioder)} som må vurderes på nytt.`,
        };
    }
    if (harFjernedePerioder && harNyePerioder) {
        return {
            tittel: `Endringer i ${tittelPerioder}`,
            beskrivelse: `Det er registrert at ${periodeFrase(antallFjernedePerioder)} er fjernet og ${periodeFrase(antallNyePerioder)} er lagt til som må vurderes på nytt.`,
        };
    }
    if (harFjernedePerioder && harEndretPerioder) {
        return {
            tittel: `Endringer i ${tittelPerioder}`,
            beskrivelse: `Det er registrert at ${periodeFrase(antallFjernedePerioder)} er fjernet og endringer i ${periodeFrase(antallEndredePerioder)} som må vurderes på nytt.`,
        };
    }
    if (harFjernedePerioder) {
        return {
            tittel: `Endringer i ${tittelPerioder}`,
            beskrivelse: `Det er registrert at ${periodeFrase(antallFjernedePerioder)} er fjernet, og du må vurdere saken på nytt.`,
        };
    }
    if (harNyePerioder && harEndretPerioder) {
        return {
            tittel: `Endringer i ${tittelPerioder}`,
            beskrivelse: `Det er registrert ${periodeFrase(antallNyePerioder)} og endringer i ${periodeFrase(antallEndredePerioder)} som må vurderes på nytt.`,
        };
    }
    if (harEndretPerioder) {
        return {
            tittel: `Endringer i ${tittelPerioder}`,
            beskrivelse: `Det er registrert endringer i ${periodeFrase(antallEndredePerioder)} som må vurderes på nytt.`,
        };
    }
    return {
        tittel: antallNyePerioder > 1 ? 'Nye perioder må vurderes' : 'Ny periode må vurderes',
        beskrivelse: `Det er registrert ${periodeFrase(antallNyePerioder)} i kravgrunnlaget som må vurderes.`,
    };
};

export const NyttKravgrunnlagModal: FC<Props> = ({ endretKravgrunnlag, onFullført }: Props) => {
    const { behandlingId } = useBehandling();
    const queryClient = useQueryClient();

    const { endringer } = endretKravgrunnlag;
    const fjernedePerioder = endringer.filter(
        (endring): endring is FjernetPeriodeDto => endring.type === 'FjernetPeriodeDto'
    );
    const nyePerioder = endringer.filter(
        (endring): endring is NyPeriodeDto => endring.type === 'NyPeriodeDto'
    );
    const endretPerioder = endringer.filter(
        (endring): endring is EndretPeriodeDto => 'gammelPeriode' in endring
    );

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
                    {fjernedePerioder.map(periode => (
                        <FjernetPeriodeKort
                            key={`${periode.fom}-${periode.tom}`}
                            periode={periode}
                        />
                    ))}
                    {nyePerioder.map(periode => (
                        <NyPeriodeKort key={`${periode.fom}-${periode.tom}`} periode={periode} />
                    ))}
                    {endretPerioder.map(periode => (
                        <EndretPeriodeKort
                            key={`${periode.fom}-${periode.tom}`}
                            periode={periode}
                        />
                    ))}
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
