import * as React from 'react';

import { ErrorMessage, Modal } from '@navikt/ds-react';
import { FamilieSelect } from '@navikt/familie-form-elements';
import { Valideringsstatus } from '@navikt/familie-skjema';

import { useBehandling } from '../../../../../context/BehandlingContext';
import { IBehandling, manuelleVenteÅrsaker, venteårsaker } from '../../../../../typer/behandling';
import { datoformatNorsk } from '../../../../../utils';
import {
    BehandlingsMenyButton,
    FTButton,
    Spacer20,
    Spacer8,
} from '../../../../Felleskomponenter/Flytelementer';
import { usePåVentBehandling } from '../../../../Felleskomponenter/Modal/PåVent/PåVentContext';
import { maxTidsfrist, minTidsfrist } from '../../../../Felleskomponenter/Modal/PåVent/PåVentModal';
import { FixedDatovelger } from '../../../../Felleskomponenter/Skjemaelementer/';

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
                        <FixedDatovelger
                            {...skjema.felter.tidsfrist.hentNavBaseSkjemaProps(
                                skjema.visFeilmeldinger
                            )}
                            id={'frist'}
                            label={'Frist'}
                            onChange={(nyVerdi?: string) =>
                                skjema.felter.tidsfrist.onChange(nyVerdi ? nyVerdi : '')
                            }
                            limitations={{ minDate: minTidsfrist(), maxDate: maxTidsfrist() }}
                            placeholder={datoformatNorsk.DATO}
                            value={skjema.felter.tidsfrist.verdi}
                            feil={
                                ugyldigDatoValgt
                                    ? skjema.felter.tidsfrist.feilmelding?.toString()
                                    : ''
                            }
                        />
                        <Spacer20 />
                        <FamilieSelect
                            {...skjema.felter.årsak.hentNavBaseSkjemaProps(skjema.visFeilmeldinger)}
                            label={'Årsak'}
                            value={skjema.felter.årsak.verdi}
                            onChange={event => skjema.felter.årsak.onChange(event)}
                            required={true}
                        >
                            <option value="" disabled>
                                Velg årsak
                            </option>
                            {manuelleVenteÅrsaker.map((årsak, index) => (
                                <option key={`årsak_${index}`} value={årsak}>
                                    {venteårsaker[årsak]}
                                </option>
                            ))}
                        </FamilieSelect>
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
