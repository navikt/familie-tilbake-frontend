import * as React from 'react';

import { ErrorMessage, Modal } from '@navikt/ds-react';
import { FamilieSelect } from '@navikt/familie-form-elements';
import { RessursStatus } from '@navikt/familie-typer';

import { useBehandling } from '../../../../../context/BehandlingContext';
import { Ytelsetype } from '../../../../../kodeverk';
import { IBehandling } from '../../../../../typer/behandling';
import { finnMuligeEnheter, IArbeidsfordelingsenhet } from '../../../../../typer/enhet';
import { hentFrontendFeilmelding } from '../../../../../utils/';
import {
    BehandlingsMenyButton,
    FTButton,
    Spacer8,
} from '../../../../Felleskomponenter/Flytelementer';
import { FamilieTilbakeTextArea } from '../../../../Felleskomponenter/Skjemaelementer';
import { useEndreBehandlendeEnhet } from './EndreBehandlendeEnhetContext';

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
                        <FamilieSelect
                            {...skjema.felter.enhet.hentNavInputProps(skjema.visFeilmeldinger)}
                            erLesevisning={false}
                            name="enhet"
                            label={'Velg ny enhet'}
                            value={skjema.felter.enhet.verdi}
                            onChange={e => skjema.felter.enhet.validerOgSettFelt(e.target.value)}
                        >
                            <option value={''} disabled={true}>
                                Velg ny enhet
                            </option>
                            {behandendeEnheter.map(enhet => (
                                <option key={enhet.enhetId} value={enhet.enhetId}>
                                    {enhet.enhetNavn}
                                </option>
                            ))}
                        </FamilieSelect>
                        <Spacer8 />
                        <FamilieTilbakeTextArea
                            {...skjema.felter.begrunnelse.hentNavInputProps(
                                skjema.visFeilmeldinger
                            )}
                            label={'Begrunnelse'}
                            erLesevisning={false}
                            value={skjema.felter.begrunnelse.verdi}
                            onChange={e =>
                                skjema.felter.begrunnelse.validerOgSettFelt(e.target.value)
                            }
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
                        <FTButton
                            variant="tertiary"
                            key={'avbryt'}
                            onClick={() => {
                                settVisModal(false);
                            }}
                            size="small"
                        >
                            Avbryt
                        </FTButton>
                        <FTButton
                            variant="primary"
                            disabled={skjema.submitRessurs.status === RessursStatus.HENTER}
                            key={'bekreft'}
                            onClick={() => sendInn()}
                            size="small"
                        >
                            Bekreft
                        </FTButton>
                    </Modal.Footer>
                </Modal>
            )}
        </>
    );
};

export default EndreBehandlendeEnhet;
