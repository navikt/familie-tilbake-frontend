import type { Behandling } from '../../../../typer/behandling';

import { FileResetIcon } from '@navikt/aksel-icons';
import { ActionMenu, Button, ErrorMessage, Modal, Select } from '@navikt/ds-react';
import * as React from 'react';
import { useRef } from 'react';

import { useRevurderSkjema } from './RevurderSkjemaContext';
import { behandlingårsaker, behandlingÅrsaker } from '../../../../typer/behandling';
import { hentFrontendFeilmelding } from '../../../../utils';

type Props = {
    behandlingId: Behandling['behandlingId'];
};

export const Revurder: React.FC<Props> = ({ behandlingId }) => {
    const ref = useRef<HTMLDialogElement>(null);
    const { skjema, sendInn, nullstillSkjema } = useRevurderSkjema(behandlingId, ref);
    const feilmelding = hentFrontendFeilmelding(skjema.submitRessurs);

    return (
        <>
            <ActionMenu.Item
                onSelect={() => ref.current?.showModal()}
                className="text-xl cursor-pointer"
                icon={<FileResetIcon aria-hidden />}
            >
                Revurder
            </ActionMenu.Item>

            <Modal
                ref={ref}
                header={{
                    heading: 'Revurder tilbakekreving',
                    size: 'medium',
                    icon: <FileResetIcon aria-hidden className="mr-2" />,
                }}
                onClose={nullstillSkjema}
            >
                <Modal.Body className="flex flex-col gap-4">
                    <Select
                        {...skjema.felter.behandlingsårsak.hentNavBaseSkjemaProps(
                            skjema.visFeilmeldinger
                        )}
                        name="Behandling"
                        label="Årsak til revurderingen"
                        value={skjema.felter.behandlingsårsak.verdi ?? 'default'}
                        onChange={event => skjema.felter.behandlingsårsak.onChange(event)}
                    >
                        <option value="default" disabled>
                            Velg årsak
                        </option>
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
                        Revurder
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
