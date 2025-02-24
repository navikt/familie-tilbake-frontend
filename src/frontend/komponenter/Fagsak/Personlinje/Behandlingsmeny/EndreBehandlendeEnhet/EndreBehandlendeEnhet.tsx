import type { Ytelsetype } from '../../../../../kodeverk';
import type { IBehandling } from '../../../../../typer/behandling';
import type { IArbeidsfordelingsenhet } from '../../../../../typer/enhet';

import { Button, ErrorMessage, Modal, Select, Textarea } from '@navikt/ds-react';
import * as React from 'react';

import { useEndreBehandlendeEnhet } from './EndreBehandlendeEnhetContext';
import { useBehandling } from '../../../../../context/BehandlingContext';
import { finnMuligeEnheter } from '../../../../../typer/enhet';
import { RessursStatus } from '../../../../../typer/ressurs';
import { hentFrontendFeilmelding } from '../../../../../utils/';
import { BehandlingsMenyButton, Spacer8 } from '../../../../Felleskomponenter/Flytelementer';

interface IProps {
    ytelse: Ytelsetype;
    behandling: IBehandling;
    onListElementClick: () => void;
}

const EndreBehandlendeEnhet: React.FC<IProps> = ({ ytelse, behandling, onListElementClick }) => {
    const [visModal, settVisModal] = React.useState<boolean>(false);
    const [behandendeEnheter, settBehandendeEnheter] = React.useState<IArbeidsfordelingsenhet[]>(
        []
    );
    const { behandlingILesemodus } = useBehandling();
    const { skjema, sendInn, nullstillSkjema } = useEndreBehandlendeEnhet(
        behandling.behandlingId,
        () => {
            settVisModal(false);
        }
    );

    React.useEffect(() => {
        settBehandendeEnheter(finnMuligeEnheter(ytelse));
    }, [ytelse]);

    const feilmelding = hentFrontendFeilmelding(skjema.submitRessurs);

    return (
        <>
            <BehandlingsMenyButton
                variant="tertiary"
                onClick={() => {
                    settVisModal(true);
                    onListElementClick();
                }}
                disabled={!behandling.kanEndres || behandlingILesemodus}
            >
                Endre behandlende enhet
            </BehandlingsMenyButton>
            {visModal && (
                <Modal
                    open
                    header={{ heading: 'Endre enhet for behandlingen', size: 'medium' }}
                    portal={true}
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
                            <option value="" disabled={true}>
                                Velg ny enhet
                            </option>
                            {behandendeEnheter.map(enhet => (
                                <option key={enhet.enhetId} value={enhet.enhetId}>
                                    {enhet.enhetNavn}
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
                            disabled={skjema.submitRessurs.status === RessursStatus.HENTER}
                            key="bekreft"
                            onClick={() => sendInn()}
                            size="small"
                        >
                            Bekreft
                        </Button>
                        <Button
                            variant="tertiary"
                            key="avbryt"
                            onClick={() => {
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

export default EndreBehandlendeEnhet;
