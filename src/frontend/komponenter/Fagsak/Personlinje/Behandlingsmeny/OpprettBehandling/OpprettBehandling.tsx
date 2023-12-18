import * as React from 'react';

import { ErrorMessage, Modal } from '@navikt/ds-react';
import { FamilieSelect } from '@navikt/familie-form-elements';

import {
    Behandlingstype,
    behandlingsTyper,
    behandlingstyper,
    behandlingårsaker,
    behandlingÅrsaker,
    IBehandling,
} from '../../../../../typer/behandling';
import { IFagsak } from '../../../../../typer/fagsak';
import { hentFrontendFeilmelding } from '../../../../../utils/';
import {
    BehandlingsMenyButton,
    FTButton,
    Spacer20,
    Spacer8,
} from '../../../../Felleskomponenter/Flytelementer';
import { useOpprettBehandlingSkjema } from './OpprettBehandlingSkjemaContext';

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
                        <FamilieSelect
                            erLesevisning={true}
                            name={'Behandling'}
                            label={'Type behandling'}
                            value={skjema.felter.behandlingstype.verdi}
                            lesevisningVerdi={
                                behandlingstyper[Behandlingstype.REVURDERING_TILBAKEKREVING]
                            }
                        >
                            {behandlingsTyper.map(opt => (
                                <option key={opt} value={opt}>
                                    {behandlingstyper[opt]}
                                </option>
                            ))}
                        </FamilieSelect>
                        <Spacer20 />
                        <FamilieSelect
                            {...skjema.felter.behandlingsårsak.hentNavBaseSkjemaProps(
                                skjema.visFeilmeldinger
                            )}
                            erLesevisning={false}
                            name={'Behandling'}
                            label={'Årsak til revuderingen'}
                            value={skjema.felter.behandlingsårsak.verdi}
                            onChange={event => skjema.felter.behandlingsårsak.onChange(event)}
                        >
                            <option disabled={true} value={''}>
                                Velg årsak til revurderingen
                            </option>
                            {behandlingÅrsaker.map(opt => (
                                <option key={opt} value={opt}>
                                    {behandlingårsaker[opt]}
                                </option>
                            ))}
                        </FamilieSelect>
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
                        <FTButton
                            variant="primary"
                            key={'bekreft'}
                            onClick={() => {
                                sendInn();
                            }}
                            size="small"
                        >
                            Ok
                        </FTButton>
                        <FTButton
                            variant="tertiary"
                            key={'avbryt'}
                            onClick={() => {
                                nullstillSkjema();
                                settVisModal(false);
                            }}
                            size="small"
                        >
                            Avbryt
                        </FTButton>
                    </Modal.Footer>
                </Modal>
            )}
        </>
    );
};

export default OpprettBehandling;
