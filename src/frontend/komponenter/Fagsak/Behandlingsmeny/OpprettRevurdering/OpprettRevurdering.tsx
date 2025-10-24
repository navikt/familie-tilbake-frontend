import type { Behandling } from '../../../../typer/behandling';

import { PlusIcon } from '@navikt/aksel-icons';
import { ActionMenu, Button, ErrorMessage, Modal, Select } from '@navikt/ds-react';
import * as React from 'react';
import { useRef } from 'react';

import { useOpprettRevurderingSkjema } from './OpprettRevurderingSkjemaContext';
import {
    Behandlingstype,
    behandlingstyper,
    behandlingårsaker,
    behandlingÅrsaker,
} from '../../../../typer/behandling';
import { hentFrontendFeilmelding } from '../../../../utils';

type Props = {
    behandlingId: Behandling['behandlingId'];
};

export const OpprettRevurdering: React.FC<Props> = ({ behandlingId }) => {
    const ref = useRef<HTMLDialogElement>(null);
    const { skjema, sendInn, nullstillSkjema } = useOpprettRevurderingSkjema(behandlingId, ref);
    const feilmelding = hentFrontendFeilmelding(skjema.submitRessurs);

    return (
        <>
            <ActionMenu.Item
                onSelect={() => ref.current?.showModal()}
                className="text-xl"
                icon={<PlusIcon fontSize="2rem" aria-hidden />}
            >
                Opprett revurdering
            </ActionMenu.Item>

            <Modal
                ref={ref}
                header={{ heading: 'Opprett revurdering', size: 'medium' }}
                aria-label="Opprett revurdering modal"
            >
                <Modal.Body className="flex flex-col gap-4">
                    <Select
                        readOnly
                        name="Behandling"
                        label="Type behandling"
                        defaultValue={Behandlingstype.RevurderingTilbakekreving}
                    >
                        {Object.values(Behandlingstype).map(type => (
                            <option key={type} value={type}>
                                {behandlingstyper[type]}
                            </option>
                        ))}
                    </Select>

                    <Select
                        {...skjema.felter.behandlingsårsak.hentNavBaseSkjemaProps(
                            skjema.visFeilmeldinger
                        )}
                        name="Behandling"
                        label="Årsak til revuderingen"
                        value={skjema.felter.behandlingsårsak.verdi}
                        onChange={event => skjema.felter.behandlingsårsak.onChange(event)}
                    >
                        <option disabled>Velg årsak til revurderingen</option>
                        {behandlingÅrsaker.map(årsak => (
                            <option key={årsak} value={årsak}>
                                {behandlingårsaker[årsak]}
                            </option>
                        ))}
                    </Select>
                    {feilmelding && <ErrorMessage size="small">{feilmelding}</ErrorMessage>}
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
                            ref.current?.close();
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
