import type { FC } from 'react';

import { PaperplaneIcon } from '@navikt/aksel-icons';
import { BodyShort, Box, Button, HStack, VStack } from '@navikt/ds-react';
import { useState } from 'react';

import { PdfVisningModal } from '@/komponenter/pdf-visning-modal/PdfVisningModal';
import { byggDataRessurs } from '@/typer/ressurs';
import { formatterDatostring } from '@/utils';
import { Hendelser, Sporingskontekst, sporHendelse } from '@/utils/sporing';

type Props = {
    varselbrevUrl: string | null;
    sendtTid: string;
    laster?: boolean;
};

export const Varselbrevinfo: FC<Props> = ({ varselbrevUrl, sendtTid, laster = false }: Props) => {
    const [visModal, setVisModal] = useState(false);

    return (
        <>
            <Box
                background="default"
                borderColor="neutral-subtle"
                borderWidth="1"
                borderRadius="12"
                paddingInline="space-12"
                paddingBlock="space-8"
            >
                <HStack align="center" gap="space-8" wrap={false}>
                    <HStack align="center" gap="space-16" wrap={false} className="min-w-0 grow">
                        <PaperplaneIcon
                            fontSize="2.25rem"
                            aria-hidden
                            className="shrink-0 text-ax-text-neutral-subtle"
                        />
                        <VStack className="min-w-0">
                            <BodyShort
                                size="small"
                                weight="semibold"
                                className="text-ax-text-neutral-subtle"
                            >
                                Brevet ble sendt
                            </BodyShort>
                            <BodyShort
                                as="div"
                                size="medium"
                                weight="semibold"
                                className="text-ax-text-neutral"
                            >
                                <time dateTime={sendtTid}>{formatterDatostring(sendtTid)}</time>
                            </BodyShort>
                        </VStack>
                    </HStack>
                    <Button
                        size="small"
                        data-color="neutral"
                        variant="secondary"
                        loading={laster || !varselbrevUrl}
                        onClick={(): void => {
                            sporHendelse(Hendelser.KNAPP_KLIKKET, {
                                tekst: 'Se brevet',
                                kontekst: Sporingskontekst.Forhåndsvarsel,
                                komponentId: 'vis-sendt-varselbrev',
                            });
                            setVisModal(true);
                        }}
                    >
                        Se brevet
                    </Button>
                </HStack>
            </Box>
            {varselbrevUrl && (
                <PdfVisningModal
                    åpen={visModal}
                    pdfdata={byggDataRessurs(varselbrevUrl)}
                    onRequestClose={(): void => setVisModal(false)}
                />
            )}
        </>
    );
};
