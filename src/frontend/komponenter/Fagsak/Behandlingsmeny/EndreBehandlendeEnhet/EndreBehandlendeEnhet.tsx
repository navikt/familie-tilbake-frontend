import type { Behandling } from '../../../../typer/behandling';

import { Buildings3Icon } from '@navikt/aksel-icons';
import { ActionMenu, Button, ErrorMessage, Modal, Select, Textarea } from '@navikt/ds-react';
import * as React from 'react';
import { useRef } from 'react';

import { useEndreBehandlendeEnhet } from './EndreBehandlendeEnhetContext';
import { RessursStatus } from '../../../../typer/ressurs';
import { hentFrontendFeilmelding } from '../../../../utils/';

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
    const dialogRef = useRef<HTMLDialogElement>(null);
    const { skjema, sendInn, nullstillSkjema } = useEndreBehandlendeEnhet(
        behandling.behandlingId,
        () => dialogRef.current?.close()
    );

    const feilmelding = hentFrontendFeilmelding(skjema.submitRessurs);

    return (
        <>
            <ActionMenu.Item
                onSelect={() => dialogRef.current?.showModal()}
                className="text-xl cursor-pointer"
                icon={<Buildings3Icon aria-hidden />}
            >
                Endre behandlende enhet
            </ActionMenu.Item>

            <Modal
                ref={dialogRef}
                header={{ heading: 'Endre enhet for behandlingen', size: 'medium' }}
                onClose={nullstillSkjema}
            >
                <Modal.Body className="flex flex-col gap-2">
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
                    <Textarea
                        {...skjema.felter.begrunnelse.hentNavInputProps(skjema.visFeilmeldinger)}
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
                        onClick={() => {
                            nullstillSkjema();
                            dialogRef.current?.close();
                        }}
                        size="small"
                    >
                        Avbryt
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};
