import type { IBehandling } from '../../../../../typer/behandling';

import { Button, ErrorMessage, Modal, Select } from '@navikt/ds-react';
import { addDays, addMonths } from 'date-fns';
import * as React from 'react';

import { useBehandling } from '../../../../../context/BehandlingContext';
import { Valideringsstatus } from '../../../../../hooks/skjema/typer';
import { manuelleVenteÅrsaker, venteårsaker } from '../../../../../typer/behandling';
import { dagensDato } from '../../../../../utils/dato';
import Datovelger from '../../../../Felleskomponenter/Datovelger/Datovelger';
import {
    BehandlingsMenyButton,
    Spacer20,
    Spacer8,
} from '../../../../Felleskomponenter/Flytelementer';
import { usePåVentBehandling } from '../../../../Felleskomponenter/Modal/PåVent/PåVentContext';

interface IProps {
    behandling: IBehandling;
    onListElementClick: () => void;
}

const SettBehandlingPåVent: React.FC<IProps> = ({ behandling, onListElementClick }) => {
    const [visModal, settVisModal] = React.useState<boolean>(false);
    const { hentBehandlingMedBehandlingId } = useBehandling();

    const lukkModalOgHentBehandling = () => {
        settVisModal(false);
        hentBehandlingMedBehandlingId(behandling.behandlingId);
    };

    const { skjema, onBekreft, feilmelding, tilbakestillFelterTilDefault } = usePåVentBehandling(
        lukkModalOgHentBehandling,
        undefined
    );

    const ugyldigDatoValgt =
        skjema.visFeilmeldinger &&
        skjema.felter.tidsfrist.valideringsstatus === Valideringsstatus.FEIL;

    const lukkModal = () => {
        tilbakestillFelterTilDefault();
        settVisModal(false);
    };

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
                    onClose={lukkModal}
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
                            label="Årsak"
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
                        <Button
                            variant="primary"
                            key="bekreft"
                            onClick={() => {
                                onBekreft(behandling.behandlingId);
                            }}
                            size="small"
                        >
                            Bekreft
                        </Button>
                        <Button variant="tertiary" key="avbryt" onClick={lukkModal} size="small">
                            Avbryt
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </>
    );
};

export default SettBehandlingPåVent;
