import type { Behandling } from '../../../../typer/behandling';

import { Button, Dropdown, ErrorMessage, Modal, Select } from '@navikt/ds-react';
import * as React from 'react';
import { useState } from 'react';

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
    behandling: Behandling;
};

export const OpprettBehandling: React.FC<Props> = ({ behandling }) => {
    const [visModal, settVisModal] = useState(false);
    const { skjema, sendInn, nullstillSkjema } = useOpprettBehandlingSkjema(
        behandling.behandlingId,
        settVisModal
    );

    const feilmelding = hentFrontendFeilmelding(skjema.submitRessurs);

    return (
        <Dropdown.Menu.List.Item
            disabled={!behandling.kanRevurderingOpprettes}
            onClick={() => settVisModal(true)}
        >
            Opprett behandling
            {visModal && (
                <Modal
                    open
                    header={{ heading: 'Opprett behandling', size: 'medium' }}
                    portal
                    width="small"
                    onClose={() => settVisModal(false)}
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
                        <Button key="bekreft" onClick={sendInn} size="small">
                            Ok
                        </Button>
                        <Button
                            variant="tertiary"
                            key="avbryt"
                            onClick={() => {
                                nullstillSkjema();
                                settVisModal(false);
                            }}
                            size="small"
                        >
                            Avbryt
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </Dropdown.Menu.List.Item>
    );
};
