import type { BehandlingDto } from '../../../../generated';

import { FileResetIcon } from '@navikt/aksel-icons';
import { ActionMenu, Button, ErrorMessage, Modal, Select } from '@navikt/ds-react';
import * as React from 'react';
import { useRef } from 'react';

import { useRevurderSkjema } from './RevurderSkjemaContext';
import { Behandlingårsak, behandlingårsaker } from '../../../../typer/behandling';
import { hentFrontendFeilmelding } from '../../../../utils';
import { MODAL_BREDDE } from '../utils';

type Props = {
    behandlingId: BehandlingDto['behandlingId'];
};

export const Revurder: React.FC<Props> = ({ behandlingId }) => {
    const ref = useRef<HTMLDialogElement>(null);
    const {
        skjema,
        sendInn,
        nullstillSkjema,
        feilmelding: storeFeilmelding,
        setFeilmelding,
    } = useRevurderSkjema(behandlingId, ref);

    const feilmelding = hentFrontendFeilmelding(skjema.submitRessurs) || storeFeilmelding;

    return (
        <>
            <ActionMenu.Item
                onSelect={() => ref.current?.showModal()}
                className="text-xl cursor-pointer"
                icon={<FileResetIcon aria-hidden />}
            >
                <span className="ml-1">Revurder</span>
            </ActionMenu.Item>

            <Modal
                ref={ref}
                header={{
                    heading: 'Revurder tilbakekreving',
                    icon: <FileResetIcon aria-hidden className="mr-2" />,
                }}
                onClose={() => {
                    nullstillSkjema();
                    setFeilmelding(undefined);
                }}
                className={MODAL_BREDDE}
            >
                <Modal.Body className="flex flex-col gap-4">
                    <Select
                        {...skjema.felter.behandlingsårsak.hentNavBaseSkjemaProps(
                            skjema.visFeilmeldinger
                        )}
                        name="Behandling"
                        label="Årsak til revurderingen"
                        value={skjema.felter.behandlingsårsak.verdi || 'default'}
                        onChange={skjema.felter.behandlingsårsak.onChange}
                    >
                        <option value="default" disabled>
                            Velg årsak
                        </option>
                        {Object.values(Behandlingårsak).map(årsak => (
                            <option key={årsak} value={årsak}>
                                {behandlingårsaker[årsak]}
                            </option>
                        ))}
                    </Select>
                    {feilmelding && <ErrorMessage size="small">{feilmelding}</ErrorMessage>}
                </Modal.Body>

                <Modal.Footer>
                    <Button key="bekreft" onClick={sendInn}>
                        Revurder
                    </Button>
                    <Button
                        variant="secondary"
                        key="avbryt"
                        onClick={() => {
                            nullstillSkjema();
                            setFeilmelding(undefined);
                            ref.current?.close();
                        }}
                    >
                        Avbryt
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};
