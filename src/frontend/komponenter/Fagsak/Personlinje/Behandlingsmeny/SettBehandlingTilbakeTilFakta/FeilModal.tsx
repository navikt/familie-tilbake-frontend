import type { Feil } from '../../../../../api/Feil';

import { XMarkOctagonFillIcon } from '@navikt/aksel-icons';
import { Button, Link, List, Modal, VStack } from '@navikt/ds-react';
import React from 'react';

type FeilMelding = {
    tittel: string;
    beskjed: string;
    hvaKanGjøres: string[];
    httpStatus?: string;
};

const hentFeilObjekt = (status: number): FeilMelding => {
    switch (status) {
        case 400:
            return {
                tittel: 'Ugyldig forespørsel',
                beskjed: 'Forespørselen din er ugyldig',
                httpStatus: `${status} Bad Request`,
                hvaKanGjøres: [
                    'Sjekk at du har fylt ut alle nødvendige felt.',
                    'Sjekk at dataene du har sendt er i riktig format.',
                    'Prøv igjen senere hvis problemet vedvarer.',
                ],
            };
        case 401:
            return {
                tittel: 'Uautorisert',
                beskjed: 'Du er ikke autorisert til å gjøre dette',
                httpStatus: `${status} Unauthorized`,
                hvaKanGjøres: [
                    'Logg inn med riktig bruker.',
                    'Vent et par minutter og prøv igjen.',
                ],
            };
        case 403:
            return {
                tittel: 'Ingen tilgang',
                beskjed: 'Du har ikke tilgang til å gjøre dette',
                httpStatus: `${status} Forbidden`,
                hvaKanGjøres: [
                    'Om du mener at du burde ha tilgang, ta kontakt med nærmeste leder.',
                ],
            };
        case 404:
            return {
                tittel: 'Ikke funnet',
                beskjed: 'Ressursen du prøver å nå finnes ikke',
                httpStatus: `${status} Not Found`,
                hvaKanGjøres: [
                    'Sjekk at du har riktig url.',
                    'Hvis du mener at dette er en feil, vennligst kontakt support.',
                ],
            };
        case 500:
            return {
                tittel: 'Intern feil',
                beskjed: 'Oi, dette fungerte vist ikke',
                httpStatus: `${status} Internal Server Error`,
                hvaKanGjøres: ['Last inn siden på nytt', 'Vent et par minutter og prøv igjen.'],
            };
        case 502:
        case 503:
        case 504:
            return {
                tittel: 'Feil hos noen andre',
                beskjed: 'Noe galt har skjedd hos en annen part, prøv igjen senere',
                httpStatus: `${status}`,
                hvaKanGjøres: ['Vent et par minutter og prøv igjen.'],
            };
        default:
            return {
                tittel: 'Ukjent feil',
                beskjed: 'En ukjent feil har oppstått, vennligst prøv igjen senere',
                httpStatus: `${status} Unknown Error`,
                hvaKanGjøres: ['Last inn siden på nytt', 'Vent et par minutter og prøv igjen.'],
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
    const innheholderCSRFTokenFeil = feil?.message?.includes('CSRF-token');
    return (
        <Modal
            open={erSynlig}
            onClose={() => setVisFeilModal(false)}
            header={{
                icon: <XMarkOctagonFillIcon aria-hidden color="var(--a-icon-danger)" />,
                heading: feilObjekt.tittel,
                closeButton: false,
            }}
            className="[&_.navds-modal__header]:bg-[#FFE6E6]"
            portal
        >
            <Modal.Body className="flex flex-col gap-6">
                <p style={{ color: 'var(--a-text-subtle)' }}>{feilObjekt.httpStatus}</p>

                <VStack gap="4">
                    <VStack
                        gap="4"
                        className="border-b border-solid border-b-[rgba(7,26,54,0.21)] pb-6"
                    >
                        <h2 className="font-semibold text-xl">{feilObjekt.beskjed}</h2>
                        <p>
                            {feil?.message ||
                                'Dette er ikke din feil, det er en feil vi ikke greide å håndtere.'}
                        </p>
                        <VStack>
                            <h3 className="font-semibold text-base">Hva kan du gjøre?</h3>
                            <List as="ul" size="small">
                                {!innheholderCSRFTokenFeil &&
                                    feilObjekt.hvaKanGjøres.map((handling, index) => (
                                        <List.Item key={`${handling}${index}`}>
                                            {handling}
                                        </List.Item>
                                    ))}
                                {innheholderCSRFTokenFeil && (
                                    <List.Item>
                                        Lagre det du holder på med, og last siden på nytt.
                                    </List.Item>
                                )}
                                {(feil?.status !== 403 || innheholderCSRFTokenFeil) && (
                                    <List.Item>
                                        <Link
                                            href="https://jira.adeo.no/plugins/servlet/desk/portal/541?requestGroup=828"
                                            target="_blank"
                                        >
                                            Meld feil i porten.
                                        </Link>
                                    </List.Item>
                                )}
                            </List>
                        </VStack>
                    </VStack>
                    {(fagsakId || behandlingId) && (
                        <VStack
                            gap="1"
                            style={{ color: 'var(--a-text-subtle)' }}
                            className="text-sm"
                        >
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
