import type { BehandlingDto } from '../../../../generated';

import { Buildings3Icon } from '@navikt/aksel-icons';
import { ActionMenu, Button, ErrorMessage, Modal, Select, Textarea } from '@navikt/ds-react';
import * as React from 'react';
import { useRef } from 'react';

import { useEndreEnhet } from './EndreEnhetContext';
import { RessursStatus } from '../../../../typer/ressurs';
import { hentFrontendFeilmelding } from '../../../../utils';
import { MODAL_BREDDE } from '../utils';

type Arbeidsfordelingsenhet = {
    enhetskode: BehandlingDto['enhetskode'];
    enhetsnavn: BehandlingDto['enhetsnavn'];
};

const enheter: Arbeidsfordelingsenhet[] = [
    { enhetskode: '2103', enhetsnavn: 'Nav Vikafossen' },
    { enhetskode: '4806', enhetsnavn: 'Nav Familie- og pensjonsytelser Drammen' },
    { enhetskode: '4820', enhetsnavn: 'Nav Familie- og pensjonsytelser Vadsø' },
    { enhetskode: '4833', enhetsnavn: 'Nav Familie- og pensjonsytelser Oslo 1' },
    { enhetskode: '4842', enhetsnavn: 'Nav Familie- og pensjonsytelser Stord' },
    { enhetskode: '4817', enhetsnavn: 'Nav Familie- og pensjonsytelser Steinkjer' },
];

type Props = {
    behandlingsId: BehandlingDto['behandlingId'];
};

export const EndreEnhet: React.FC<Props> = ({ behandlingsId }) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const { skjema, sendInn, nullstillSkjema } = useEndreEnhet(behandlingsId, () =>
        dialogRef.current?.close()
    );

    const feilmelding = hentFrontendFeilmelding(skjema.submitRessurs);

    return (
        <>
            <ActionMenu.Item
                onSelect={() => dialogRef.current?.showModal()}
                className="text-xl cursor-pointer"
                icon={<Buildings3Icon aria-hidden />}
            >
                <span className="ml-1">Endre enhet</span>
            </ActionMenu.Item>

            <Modal
                ref={dialogRef}
                header={{
                    heading: 'Endre enhet',
                    icon: <Buildings3Icon aria-hidden className="mr-2" />,
                }}
                onClose={nullstillSkjema}
                className={MODAL_BREDDE}
            >
                <Modal.Body className="flex flex-col gap-2">
                    <Select
                        {...skjema.felter.enhet.hentNavInputProps(skjema.visFeilmeldinger)}
                        value={skjema.felter.enhet.verdi || 'default'}
                        readOnly={false}
                        name="enhet"
                        label="Velg en ny enhet"
                    >
                        <option value="default" disabled>
                            Velg enhet
                        </option>
                        {enheter.map(enhet => (
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
                    >
                        Endre
                    </Button>
                    <Button
                        variant="secondary"
                        key="avbryt"
                        onClick={() => {
                            nullstillSkjema();
                            dialogRef.current?.close();
                        }}
                    >
                        Avbryt
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};
