import type { Behandling } from '../../../../typer/behandling';

import { TimerPauseIcon } from '@navikt/aksel-icons';
import { ActionMenu, Button, ErrorMessage, Modal, Select } from '@navikt/ds-react';
import { addDays, addMonths } from 'date-fns';
import * as React from 'react';
import { useRef } from 'react';

import { useBehandling } from '../../../../context/BehandlingContext';
import { Valideringsstatus } from '../../../../hooks/skjema/typer';
import { manuelleVenteÅrsaker, venteårsaker } from '../../../../typer/behandling';
import { dagensDato } from '../../../../utils/dato';
import Datovelger from '../../../Felleskomponenter/Datovelger/Datovelger';
import { usePåVentBehandling } from '../../../Felleskomponenter/Modal/PåVent/PåVentContext';

type Props = {
    behandling: Behandling;
};

export const SettBehandlingPåVent: React.FC<Props> = ({ behandling }) => {
    const { hentBehandlingMedBehandlingId } = useBehandling();
    const ref = useRef<HTMLDialogElement>(null);

    const lukkModalOgHentBehandling = (): void => {
        ref.current?.close();
        hentBehandlingMedBehandlingId(behandling.behandlingId);
    };

    const { skjema, onBekreft, feilmelding, tilbakestillFelterTilDefault } = usePåVentBehandling(
        lukkModalOgHentBehandling,
        undefined
    );

    const ugyldigDatoValgt =
        skjema.visFeilmeldinger &&
        skjema.felter.tidsfrist.valideringsstatus === Valideringsstatus.Feil;

    const lukkModal = (): void => {
        tilbakestillFelterTilDefault();
        ref.current?.close();
    };

    return (
        <ActionMenu.Item
            onSelect={() => ref.current?.showModal()}
            icon={<TimerPauseIcon aria-hidden />}
            className="text-xl"
        >
            Sett på vent
            <Modal
                ref={ref}
                header={{
                    heading: 'Sett behandlingen på vent',
                    size: 'medium',
                }}
                portal
                width="small"
            >
                <Modal.Body className="flex flex-col gap-4">
                    <Datovelger
                        felt={skjema.felter.tidsfrist}
                        label="Frist"
                        visFeilmeldinger={ugyldigDatoValgt}
                        minDatoAvgrensning={addDays(dagensDato, 1)}
                        maksDatoAvgrensning={addMonths(dagensDato, 3)}
                    />
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
                        <ErrorMessage size="small">{feilmelding}</ErrorMessage>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        key="bekreft"
                        onClick={() => onBekreft(behandling.behandlingId)}
                        size="small"
                    >
                        Bekreft
                    </Button>
                    <Button variant="tertiary" key="avbryt" onClick={lukkModal} size="small">
                        Avbryt
                    </Button>
                </Modal.Footer>
            </Modal>
        </ActionMenu.Item>
    );
};
