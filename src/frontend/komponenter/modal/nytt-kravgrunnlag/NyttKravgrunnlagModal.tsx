import type { FC } from 'react';
import type { EndretKravgrunnlag, EndretPeriodeDto, NyPeriodeDto } from '@/generated';

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

const NyPeriodeKort: FC<{ periode: NyPeriodeDto }> = ({ periode }: { periode: NyPeriodeDto }) => {
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
                <VStack gap="space-1">
                    <BodyShort weight="semibold">Periode</BodyShort>
                    <BodyShort>
                        {formatterDatostring(periode.fom)}–{formatterDatostring(periode.tom)}
                    </BodyShort>
                    {periodelengde && <BodyShort size="small">{periodelengde}</BodyShort>}
                </VStack>
                <VStack gap="space-1">
                    <BodyShort weight="semibold">Feilutbetalt</BodyShort>
                    <BodyShort className="text-ax-text-brand-magenta">
                        {formatCurrencyNoKr(periode.beløp)}
                    </BodyShort>
                </VStack>
            </HStack>
        </Box>
    );
};

const EndretPeriodeKort: FC<{ periode: EndretPeriodeDto }> = ({
    periode,
}: {
    periode: EndretPeriodeDto;
}) => {
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
                            <VStack gap="space-1" align="start">
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
                            <VStack gap="space-1" align="start">
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
                        <VStack gap="space-1" align="start">
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

export const NyttKravgrunnlagModal: FC<Props> = ({ endretKravgrunnlag, onFullført }: Props) => {
    const { behandlingId } = useBehandling();
    const queryClient = useQueryClient();

    const { endringer } = endretKravgrunnlag;
    const nyePerioder = endringer.filter(
        (endring): endring is NyPeriodeDto => (endring as { type: string }).type === 'ny_periode'
    );
    const endretPerioder = endringer.filter(
        (endring): endring is EndretPeriodeDto =>
            (endring as { type: string }).type === 'endret_periode'
    );
    const harNyePerioder = nyePerioder.length > 0;
    const harEndretPerioder = endretPerioder.length > 0;

    let tittel: string;
    let beskrivelse: string;
    if (harNyePerioder && harEndretPerioder) {
        tittel = 'Endringer i periodene';
        beskrivelse =
            'Det er både registrert en ny periode og endringer i eksisterende periode som må vurderes på nytt.';
    } else if (harEndretPerioder) {
        tittel = 'Endringer i eksisterende periode';
        beskrivelse = 'Det er registrert endringer i eksisterende periode som må vurderes på nytt.';
    } else {
        tittel = nyePerioder.length > 1 ? 'Nye perioder må vurderes' : 'Ny periode må vurderes';
        beskrivelse = 'Det er registrert en ny periode i kravgrunnlaget som må vurderes.';
    }

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
