import type { IBehandling } from '../../../../../typer/behandling';
import type { IFagsak } from '../../../../../typer/fagsak';

import { Button, ErrorMessage, Modal, Select } from '@navikt/ds-react';
import * as React from 'react';

import { useOpprettBehandlingSkjema } from './OpprettBehandlingSkjemaContext';
import {
    Behandlingstype,
    behandlingstyper,
    behandlingårsaker,
    behandlingÅrsaker,
} from '../../../../../typer/behandling';
import { hentFrontendFeilmelding } from '../../../../../utils/';
import {
    BehandlingsMenyButton,
    Spacer20,
    Spacer8,
} from '../../../../Felleskomponenter/Flytelementer';

interface IProps {
    behandling: IBehandling;
    fagsak: IFagsak;
    onListElementClick: () => void;
}

const OpprettBehandling: React.FC<IProps> = ({ behandling, fagsak, onListElementClick }) => {
    const [visModal, settVisModal] = React.useState<boolean>(false);
    const { skjema, sendInn, nullstillSkjema } = useOpprettBehandlingSkjema(
        fagsak,
        behandling.behandlingId,
        settVisModal
    );

    const feilmelding = hentFrontendFeilmelding(skjema.submitRessurs);

    return (
        <>
            <BehandlingsMenyButton
                variant="tertiary"
                onClick={() => {
                    settVisModal(true);
                    onListElementClick();
                }}
                disabled={!behandling.kanRevurderingOpprettes}
            >
                Opprett behandling
            </BehandlingsMenyButton>

            {visModal && (
                <Modal
                    open
                    header={{ heading: 'Opprett behandling', size: 'medium' }}
                    portal={true}
                    width="small"
                    onClose={() => {
                        settVisModal(false);
                    }}
                >
                    <Modal.Body>
                        <Select
                            readOnly={true}
                            name="Behandling"
                            label="Type behandling"
                            value={Behandlingstype.REVURDERING_TILBAKEKREVING}
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
                            <option disabled={true} value="">
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
                            variant="primary"
                            key="bekreft"
                            onClick={() => {
                                sendInn();
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
                                settVisModal(false);
                            }}
                            size="small"
                        >
                            Avbryt
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </>
    );
};

export default OpprettBehandling;
