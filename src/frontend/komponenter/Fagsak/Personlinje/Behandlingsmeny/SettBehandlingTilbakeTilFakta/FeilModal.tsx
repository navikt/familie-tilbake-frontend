import type { Feil } from '../../../../../api/Feil';

import { XMarkOctagonFillIcon } from '@navikt/aksel-icons';
import { Button, List, Modal, VStack } from '@navikt/ds-react';
import React from 'react';

type FeilMelding = {
    tittel: string;
    beskjed: string;
    httpStatus?: string;
};

const hentFeilObjekt = (status: number): FeilMelding => {
    switch (status) {
        case 400:
            return {
                tittel: 'Ugyldig forespørsel',
                beskjed: 'Forespørselen din er ugyldig',
                httpStatus: `${status} Bad Request`,
            };
        case 401:
            return {
                tittel: 'Uautorisert',
                beskjed: 'Du er ikke autorisert til å gjøre dette',
                httpStatus: `${status} Unauthorized`,
            };
        case 403:
            return {
                tittel: 'Ingen tilgang',
                beskjed: 'Du har ikke tilgang til å gjøre dette',
                httpStatus: `${status} Forbidden`,
            };
        case 404:
            return {
                tittel: 'Ikke funnet',
                beskjed: 'Ressursen du prøver å nå finnes ikke',
                httpStatus: `${status} Not Found`,
            };
        case 500:
            return {
                tittel: 'Intern feil',
                beskjed: 'Oi, dette fungerte vist ikke',
                httpStatus: `${status} Internal Server Error`,
            };
        case 502:
        case 503:
        case 504:
            return {
                tittel: 'Feil hos noen andre',
                beskjed: 'Noe galt har skjedd hos en annen part, prøv igjen senere',
                httpStatus: `${status}`,
            };
        default:
            return {
                tittel: 'Ukjent feil',
                beskjed: 'En ukjent feil har oppstått, vennligst prøv igjen senere',
                httpStatus: `${status} Unknown Error`,
            };
    }
};

interface Props {
    feil: Feil | null;
    erSynlig: boolean;
    setVisFeilModal: (setVisFeilModal: boolean) => void;
    behandlingId?: string;
    fagsakId?: string;
}

export const FeilModal = ({ feil, erSynlig, setVisFeilModal, behandlingId, fagsakId }: Props) => {
    const feilObjekt = feil?.status ? hentFeilObjekt(feil.status) : hentFeilObjekt(500);
    return (
        <Modal
            open={erSynlig}
            onClose={() => setVisFeilModal(false)}
            header={{
                icon: <XMarkOctagonFillIcon aria-hidden color="var(--a-icon-danger)" />,
                heading: feilObjekt.tittel,
                closeButton: false,
            }}
            className="bg-red-300"
            portal
        >
            <Modal.Body className="flex flex-col gap-6">
                <p style={{ color: 'var(--a-text-subtle)' }}>{feilObjekt.httpStatus}</p>

                <VStack gap="4">
                    <VStack gap="4">
                        <h2 className="font-semibold text-xl">{feilObjekt.beskjed}</h2>
                        <p>
                            {feil?.message ||
                                'Dette er ikke din feil, det er en feil vi ikke greide å håndtere.'}
                        </p>
                        <VStack>
                            <h3 className="font-semibold text-base">Hva kan du gjøre?</h3>
                            <List as="ul">
                                <List.Item>
                                    Om du mener at du <i>burde</i> ha tilgang, ta kontakt med
                                    nærmeste leder eller Nav IT identhåndtering.
                                </List.Item>
                                <List.Item>Meld feil i porten.</List.Item>
                            </List>
                        </VStack>
                    </VStack>
                    {(fagsakId || behandlingId) && (
                        <VStack gap="1" style={{ color: 'var(--a-text-subtle)' }}>
                            {fagsakId && <span>Fagsak id: {fagsakId}</span>}
                            {behandlingId && <span>Behandlings id: {behandlingId}</span>}
                        </VStack>
                    )}
                </VStack>
            </Modal.Body>
            <Modal.Footer>
                <Button type="button" onClick={() => setVisFeilModal(false)}>
                    Ok
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
