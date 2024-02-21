import * as React from 'react';

import { ErrorMessage, Modal, Select } from '@navikt/ds-react';
import { Valideringsstatus } from '@navikt/familie-skjema';

import { useBehandling } from '../../../../../context/BehandlingContext';
import { IBehandling, manuelleVenteÅrsaker, venteårsaker } from '../../../../../typer/behandling';
import {
    BehandlingsMenyButton,
    FTButton,
    Spacer20,
    Spacer8,
} from '../../../../Felleskomponenter/Flytelementer';
import { usePåVentBehandling } from '../../../../Felleskomponenter/Modal/PåVent/PåVentContext';
import { addDays, addMonths } from 'date-fns';
import { dagensDato } from '../../../../../utils/dato';
import Datovelger from '../../../../Felleskomponenter/Datovelger/Datovelger';

interface IProps {
    behandling: IBehandling;
    onListElementClick: () => void;
}

const SettBehandlingPåVent: React.FC<IProps> = ({ behandling, onListElementClick }) => {
    const [visModal, settVisModal] = React.useState<boolean>(false);
    const { hentBehandlingMedBehandlingId } = useBehandling();

    const { skjema, onBekreft, nullstillSkjema, feilmelding } = usePåVentBehandling(
        (suksess: boolean) => {
            settVisModal(false);
            if (suksess) {
                hentBehandlingMedBehandlingId(behandling.behandlingId);
            }
        },
        undefined
    );

    const ugyldigDatoValgt =
        skjema.visFeilmeldinger &&
        skjema.felter.tidsfrist.valideringsstatus === Valideringsstatus.FEIL;

    return (
        <>
            <BehandlingsMenyButton
                variant="tertiary"
                onClick={() => {
                    settVisModal(true);
                    onListElementClick();
                }}
                disabled={!behandling.kanEndres}
            >
                Sett behandling på vent
            </BehandlingsMenyButton>

            {visModal && (
                <Modal
                    open
                    header={{
                        heading: 'Sett behandlingen på vent',
                        size: 'medium',
                    }}
                    portal={true}
                    width="small"
                    onClose={() => {
                        settVisModal(false);
                    }}
                >
                    <Modal.Body>
                        <Datovelger
                            felt={skjema.felter.tidsfrist}
                            label="Frist"
                            visFeilmeldinger={ugyldigDatoValgt}
                            minDatoAvgrensning={addDays(dagensDato, 1)}
                            maksDatoAvgrensning={addMonths(dagensDato, 3)}
                        />
                        <Spacer20 />
                        <Select
                            {...skjema.felter.årsak.hentNavInputProps(skjema.visFeilmeldinger)}
                            label={'Årsak'}
                        >
                            <option value="" disabled>
                                Velg årsak
                            </option>
                            {manuelleVenteÅrsaker.map((årsak, index) => (
                                <option key={`årsak_${index}`} value={årsak}>
                                    {venteårsaker[årsak]}
                                </option>
                            ))}
                        </Select>
                        {feilmelding && feilmelding !== '' && (
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
                                onBekreft(behandling.behandlingId);
                            }}
                            size="small"
                        >
                            Bekreft
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

export default SettBehandlingPåVent;
