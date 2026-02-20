import type { Feil } from '@api/feil';

import { useBehandling } from '@context/BehandlingContext';
import { useFagsak } from '@context/FagsakContext';
import { XMarkOctagonFillIcon } from '@navikt/aksel-icons';
import { Button, Heading, Link, List, Modal, VStack, Box } from '@navikt/ds-react';
import React from 'react';

import { hentFeilObjekt } from './feilObjekt';
import { hentStatus } from './hentStatus';

type Props = {
    feil: Feil;
    lukkFeilModal: () => void;
    beskjed?: string;
};

export const FeilModal: React.FC<Props> = ({ feil, lukkFeilModal, beskjed }: Props) => {
    const { behandlingId } = useBehandling();
    const { eksternFagsakId } = useFagsak();
    const feilObjekt = hentFeilObjekt(hentStatus(feil));
    const innheholderCSRFTokenFeil = feil.message?.includes('CSRF-token');
    return (
        <Modal open onClose={lukkFeilModal} aria-labelledby="modal-heading" portal>
            <Modal.Header className="bg-[#FFE6E6]" closeButton={false}>
                <Heading className="flex items-center flex-row gap-1" size="medium">
                    <XMarkOctagonFillIcon aria-hidden color="var(--ax-text-danger-decoration)" />
                    {feilObjekt.tittel}
                </Heading>
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-6">
                <p className="text-[#010B18AD] pt-4">{feilObjekt.httpStatus}</p>
                <VStack gap="space-16">
                    <VStack
                        gap="space-16"
                        className="border-b border-solid border-b-[#071A3636] pb-6"
                    >
                        <h2 className="font-semibold text-xl">{beskjed ?? feilObjekt.beskjed}</h2>
                        <p>{feil.message}</p>
                        <VStack>
                            <h3 className="font-semibold text-base">Hva kan du gjøre?</h3>
                            <Box marginBlock="space-12" asChild>
                                <List data-aksel-migrated-v8 as="ul" size="small">
                                    {!innheholderCSRFTokenFeil &&
                                        feilObjekt.hvaKanGjøres.map((handling, index) => (
                                            <List.Item key={`${handling}${index}`}>
                                                {handling}
                                            </List.Item>
                                        ))}
                                    {innheholderCSRFTokenFeil && (
                                        <List.Item>
                                            Lagre det du holder på med, og last siden på nytt
                                        </List.Item>
                                    )}
                                    {(feil.status !== 403 || innheholderCSRFTokenFeil) && (
                                        <List.Item>
                                            <Link
                                                href="https://jira.adeo.no/plugins/servlet/desk/portal/541/create/6054"
                                                target="_blank"
                                            >
                                                Meld feil i porten
                                            </Link>
                                        </List.Item>
                                    )}
                                </List>
                            </Box>
                        </VStack>
                    </VStack>

                    <VStack gap="space-4" className="text-sm text-[#010B18AD]">
                        <span>Fagsak ID: {eksternFagsakId}</span>
                        <span>Behandling ID: {behandlingId}</span>
                    </VStack>
                </VStack>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={lukkFeilModal}>Ok</Button>
            </Modal.Footer>
        </Modal>
    );
};
