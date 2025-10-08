import type { Ytelsetype } from '../../../../../kodeverk';
import type { Behandling } from '../../../../../typer/behandling';
import type { Arbeidsfordelingsenhet } from '../../../../../typer/enhet';

import { Button, ErrorMessage, Modal, Select, Textarea } from '@navikt/ds-react';
import * as React from 'react';
import { useEffect, useState } from 'react';

import { useEndreBehandlendeEnhet } from './EndreBehandlendeEnhetContext';
import { useBehandling } from '../../../../../context/BehandlingContext';
import { finnMuligeEnheter } from '../../../../../typer/enhet';
import { RessursStatus } from '../../../../../typer/ressurs';
import { hentFrontendFeilmelding } from '../../../../../utils/';
import { BehandlingsMenyButton, Spacer8 } from '../../../../Felleskomponenter/Flytelementer';

type Props = {
    ytelse: Ytelsetype;
    behandling: Behandling;
};

export const EndreBehandlendeEnhet: React.FC<Props> = ({ ytelse, behandling }) => {
    const [visModal, settVisModal] = useState(false);
    const [behandlendeEnheter, setBehandlendeEnheter] = useState<Arbeidsfordelingsenhet[]>([]);
    const { behandlingILesemodus } = useBehandling();
    const { skjema, sendInn, nullstillSkjema } = useEndreBehandlendeEnhet(
        behandling.behandlingId,
        () => settVisModal(false)
    );

    useEffect(() => {
        setBehandlendeEnheter(finnMuligeEnheter());
    }, [ytelse]);

    const feilmelding = hentFrontendFeilmelding(skjema.submitRessurs);

    return (
        <>
            <BehandlingsMenyButton
                variant="tertiary"
                onClick={() => settVisModal(true)}
                disabled={!behandling.kanEndres || behandlingILesemodus}
            >
                Endre behandlende enhet
            </BehandlingsMenyButton>
            {visModal && (
                <Modal
                    open
                    header={{ heading: 'Endre enhet for behandlingen', size: 'medium' }}
                    portal
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
                            <option value="" disabled>
                                Velg ny enhet
                            </option>
                            {behandlendeEnheter.map(enhet => (
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
                            onClick={() => settVisModal(false)}
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
