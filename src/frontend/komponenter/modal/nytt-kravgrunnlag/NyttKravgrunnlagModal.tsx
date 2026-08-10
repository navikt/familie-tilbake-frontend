import type { FC } from 'react';
import type { EndretKravgrunnlag } from '@/generated';

import { BodyLong, BodyShort, Box, Button, Heading, HStack, Modal, VStack } from '@navikt/ds-react';

import { formatCurrencyNoKr, formatterDatostring, hentPeriodelengde } from '@/utils';

type Props = {
    endretKravgrunnlag: EndretKravgrunnlag;
    onStartVurdering: () => void;
};

export const NyttKravgrunnlagModal: FC<Props> = ({
    endretKravgrunnlag,
    onStartVurdering,
}: Props) => {
    const { nyPeriode, nyttBeløp } = endretKravgrunnlag;
    const periodelengde = hentPeriodelengde(nyPeriode.fom, nyPeriode.tom);

    return (
        <Modal
            open
            onClose={onStartVurdering}
            header={{ heading: 'Ny periode må vurderes', size: 'medium', closeButton: false }}
            width="medium"
            portal
        >
            <Modal.Body>
                <VStack gap="space-16">
                    <BodyLong>
                        Det er registrert en endring i kravgrunnlaget som må vurderes.
                    </BodyLong>
                    <Box borderColor="success" borderWidth="1" borderRadius="12" overflow="hidden">
                        <Box
                            background="success-moderate"
                            borderColor="success"
                            borderWidth="0 0 1 0"
                            paddingInline="space-16"
                            paddingBlock="space-6"
                        >
                            <Heading level="3" size="xsmall" className="text-ax-text-success">
                                Detaljer om perioden
                            </Heading>
                        </Box>
                        <HStack
                            gap="space-32"
                            paddingInline="space-16"
                            paddingBlock="space-8 space-12"
                            className="bg-ax-bg-default"
                        >
                            <div>
                                <BodyShort weight="semibold">Periode</BodyShort>
                                <BodyShort>
                                    {formatterDatostring(nyPeriode.fom)}–
                                    {formatterDatostring(nyPeriode.tom)}
                                </BodyShort>
                                {periodelengde && (
                                    <BodyShort size="small">{periodelengde}</BodyShort>
                                )}
                            </div>
                            <div>
                                <BodyShort weight="semibold">Feilutbetalt</BodyShort>
                                <BodyShort className="text-ax-text-brand-magenta">
                                    {formatCurrencyNoKr(nyttBeløp)}
                                </BodyShort>
                            </div>
                        </HStack>
                    </Box>
                </VStack>
            </Modal.Body>
            <Modal.Footer>
                <Button size="small" onClick={onStartVurdering}>
                    Start vurderingen
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
