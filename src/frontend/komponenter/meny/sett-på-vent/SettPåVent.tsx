import { TimerPauseIcon } from '@navikt/aksel-icons';
import { ActionMenu, Button, ErrorMessage, Modal, Select } from '@navikt/ds-react';
import { useQueryClient } from '@tanstack/react-query';
import { addDays, addMonths } from 'date-fns';
import * as React from 'react';
import { useRef } from 'react';

import { useBehandling } from '~/context/BehandlingContext';
import { hentBehandlingQueryKey } from '~/generated/@tanstack/react-query.gen';
import { Valideringsstatus } from '~/hooks/skjema/typer';
import { Datovelger } from '~/komponenter/datovelger/Datovelger';
import { usePåVentBehandling } from '~/komponenter/modal/på-vent/PåVentContext';
import { manuelleVenteÅrsaker, venteårsaker } from '~/typer/behandling';
import { dagensDato } from '~/utils/dato';

import { MODAL_BREDDE } from '../utils';

export const SettPåVent: React.FC = () => {
    const { behandlingId } = useBehandling();
    const queryClient = useQueryClient();
    const dialogRef = useRef<HTMLDialogElement>(null);

    const lukkModalOgHentBehandling = async (): Promise<void> => {
        dialogRef.current?.close();
        await queryClient.invalidateQueries({
            queryKey: hentBehandlingQueryKey({ path: { behandlingId: behandlingId } }),
        });
    };

    const { skjema, onBekreft, feilmelding, tilbakestillFelterTilDefault } = usePåVentBehandling(
        lukkModalOgHentBehandling,
        undefined
    );

    const ugyldigDatoValgt =
        skjema.visFeilmeldinger &&
        skjema.felter.tidsfrist.valideringsstatus === Valideringsstatus.Feil;

    return (
        <>
            <ActionMenu.Item
                onSelect={() => dialogRef.current?.showModal()}
                icon={<TimerPauseIcon aria-hidden />}
                className="text-xl cursor-pointer"
            >
                <span className="ml-1">Sett på vent</span>
            </ActionMenu.Item>

            <Modal
                ref={dialogRef}
                header={{
                    heading: 'Sett behandlingen på vent',
                }}
                className={MODAL_BREDDE}
                onClose={tilbakestillFelterTilDefault}
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
                        label="Årsaken til at behandlingen settes på vent"
                        value={skjema.felter.årsak.verdi || ''}
                    >
                        <option value="" disabled>
                            Velg årsak
                        </option>
                        {manuelleVenteÅrsaker.map(årsak => (
                            <option key={årsak} value={årsak}>
                                {venteårsaker[årsak]}
                            </option>
                        ))}
                    </Select>
                    {feilmelding && feilmelding !== '' && (
                        <ErrorMessage size="small">{feilmelding}</ErrorMessage>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button key="bekreft" onClick={() => onBekreft(behandlingId)}>
                        Sett på vent
                    </Button>
                    <Button
                        variant="secondary"
                        key="avbryt"
                        onClick={() => {
                            tilbakestillFelterTilDefault();
                            dialogRef.current?.close();
                        }}
                    >
                        Avbryt
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};
