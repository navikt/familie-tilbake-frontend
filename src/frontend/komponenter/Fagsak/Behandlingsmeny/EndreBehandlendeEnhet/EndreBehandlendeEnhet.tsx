import type { Behandling } from '../../../../typer/behandling';

import { Buildings3Icon } from '@navikt/aksel-icons';
import { ActionMenu, Button, ErrorMessage, Modal, Select, Textarea } from '@navikt/ds-react';
import * as React from 'react';
import { useState } from 'react';

import { useEndreBehandlendeEnhet } from './EndreBehandlendeEnhetContext';
import { RessursStatus } from '../../../../typer/ressurs';
import { hentFrontendFeilmelding } from '../../../../utils/';
import { Spacer8 } from '../../../Felleskomponenter/Flytelementer';

type Arbeidsfordelingsenhet = {
    enhetskode: Behandling['enhetskode'];
    enhetsnavn: Behandling['enhetsnavn'];
};

const behandlendeEnheter: Arbeidsfordelingsenhet[] = [
    { enhetskode: '2103', enhetsnavn: 'Nav Vikafossen' },
    { enhetskode: '4806', enhetsnavn: 'Nav Familie- og pensjonsytelser Drammen' },
    { enhetskode: '4820', enhetsnavn: 'Nav Familie- og pensjonsytelser Vadsø' },
    { enhetskode: '4833', enhetsnavn: 'Nav Familie- og pensjonsytelser Oslo 1' },
    { enhetskode: '4842', enhetsnavn: 'Nav Familie- og pensjonsytelser Stord' },
    { enhetskode: '4817', enhetsnavn: 'Nav Familie- og pensjonsytelser Steinkjer' },
];

type Props = {
    behandling: Behandling;
};

export const EndreBehandlendeEnhet: React.FC<Props> = ({ behandling }) => {
    const [visModal, settVisModal] = useState(false);
    const { skjema, sendInn, nullstillSkjema } = useEndreBehandlendeEnhet(
        behandling.behandlingId,
        () => settVisModal(false)
    );

    const feilmelding = hentFrontendFeilmelding(skjema.submitRessurs);

    return (
        <ActionMenu.Item
            onSelect={() => settVisModal(true)}
            className="text-xl"
            icon={<Buildings3Icon aria-hidden />}
        >
            Endre behandlende enhet
            {visModal && (
                <Modal
                    open
                    header={{ heading: 'Endre enhet for behandlingen', size: 'medium' }}
                    portal
                    onClose={() => {
                        nullstillSkjema();
                        settVisModal(false);
                    }}
                >
                    <Modal.Body>
                        <Select
                            {...skjema.felter.enhet.hentNavInputProps(skjema.visFeilmeldinger)}
                            readOnly={false}
                            name="enhet"
                            label="Velg ny enhet"
                        >
                            <option value="" disabled>
                                Velg ny enhet
                            </option>
                            {behandlendeEnheter.map(enhet => (
                                <option key={enhet.enhetskode} value={enhet.enhetskode}>
                                    {enhet.enhetsnavn}
                                </option>
                            ))}
                        </Select>
                        <Spacer8 />
                        <Textarea
                            {...skjema.felter.begrunnelse.hentNavInputProps(
                                skjema.visFeilmeldinger
                            )}
                            label="Begrunnelse"
                            readOnly={false}
                            maxLength={400}
                        />
                        {feilmelding && <ErrorMessage size="small">{feilmelding}</ErrorMessage>}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            disabled={skjema.submitRessurs.status === RessursStatus.Henter}
                            key="bekreft"
                            onClick={sendInn}
                            size="small"
                        >
                            Bekreft
                        </Button>
                        <Button
                            variant="tertiary"
                            key="avbryt"
                            onClick={() => settVisModal(false)}
                            size="small"
                        >
                            Avbryt
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </ActionMenu.Item>
    );
};
