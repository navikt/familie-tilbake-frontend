import type { Behandling } from '../../../../typer/behandling';

import { PlusIcon } from '@navikt/aksel-icons';
import { ActionMenu, Button, ErrorMessage, Modal, Select } from '@navikt/ds-react';
import * as React from 'react';
import { useRef } from 'react';

import { useOpprettBehandlingSkjema } from './OpprettBehandlingSkjemaContext';
import {
    Behandlingstype,
    behandlingstyper,
    behandlingårsaker,
    behandlingÅrsaker,
} from '../../../../typer/behandling';
import { hentFrontendFeilmelding } from '../../../../utils/';
import { Spacer20, Spacer8 } from '../../../Felleskomponenter/Flytelementer';

type Props = {
    behandlingId: Behandling['behandlingId'];
};

export const OpprettBehandling: React.FC<Props> = ({ behandlingId }) => {
    const ref = useRef<HTMLDialogElement>(null);
    const { skjema, sendInn, nullstillSkjema } = useOpprettBehandlingSkjema(behandlingId);
    const feilmelding = hentFrontendFeilmelding(skjema.submitRessurs);

    return (
        <ActionMenu.Item onClick={() => ref.current?.showModal()} icon={<PlusIcon />}>
            Opprett behandling
            <Modal
                ref={ref}
                header={{ heading: 'Opprett behandling', size: 'medium' }}
                portal
                width="small"
            >
                <Modal.Body>
                    <Select
                        readOnly
                        name="Behandling"
                        label="Type behandling"
                        value={Behandlingstype.RevurderingTilbakekreving}
                    >
                        {Object.values(Behandlingstype).map(opt => (
                            <option key={opt} value={opt}>
                                {behandlingstyper[opt]}
                            </option>
                        ))}
                    </Select>
                    <Spacer20 />
                    <Select
                        {...skjema.felter.behandlingsårsak.hentNavBaseSkjemaProps(
                            skjema.visFeilmeldinger
                        )}
                        name="Behandling"
                        label="Årsak til revuderingen"
                        value={skjema.felter.behandlingsårsak.verdi}
                        onChange={event => skjema.felter.behandlingsårsak.onChange(event)}
                    >
                        <option disabled value="">
                            Velg årsak til revurderingen
                        </option>
                        {behandlingÅrsaker.map(opt => (
                            <option key={opt} value={opt}>
                                {behandlingårsaker[opt]}
                            </option>
                        ))}
                    </Select>
                    {feilmelding && (
                        <>
                            <Spacer8 />
                            <div className="skjemaelement__feilmelding">
                                <ErrorMessage size="small">{feilmelding}</ErrorMessage>
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        key="bekreft"
                        onClick={() => {
                            sendInn();
                            ref.current?.close();
                        }}
                        size="small"
                    >
                        Ok
                    </Button>
                    <Button
                        variant="tertiary"
                        key="avbryt"
                        onClick={() => {
                            nullstillSkjema();
                            ref.current?.close();
                        }}
                        size="small"
                    >
                        Avbryt
                    </Button>
                </Modal.Footer>
            </Modal>
        </ActionMenu.Item>
    );
};
