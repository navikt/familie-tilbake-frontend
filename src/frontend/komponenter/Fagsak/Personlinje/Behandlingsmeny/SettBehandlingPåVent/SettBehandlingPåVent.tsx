import * as React from 'react';

import KnappBase from 'nav-frontend-knapper';
import { SkjemaGruppe } from 'nav-frontend-skjema';

import { BodyLong } from '@navikt/ds-react';
import { FamilieSelect } from '@navikt/familie-form-elements';
import { Valideringsstatus } from '@navikt/familie-skjema';

import { useBehandling } from '../../../../../context/BehandlingContext';
import { IBehandling, manuelleVenteÅrsaker, venteårsaker } from '../../../../../typer/behandling';
import { datoformatNorsk, hentFrontendFeilmelding } from '../../../../../utils';
import { FTButton, Spacer20 } from '../../../../Felleskomponenter/Flytelementer';
import { usePåVentBehandling } from '../../../../Felleskomponenter/Modal/PåVent/PåVentContext';
import { maxTidsfrist, minTidsfrist } from '../../../../Felleskomponenter/Modal/PåVent/PåVentModal';
import UIModalWrapper from '../../../../Felleskomponenter/Modal/UIModalWrapper';
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
            <KnappBase
                mini={true}
                onClick={() => {
                    settVisModal(true);
                    onListElementClick();
                }}
                disabled={!behandling.kanEndres}
            >
                Sett behandling på vent
            </KnappBase>

            <UIModalWrapper
                modal={{
                    tittel: 'Sett behandlingen på vent',
                    visModal: visModal,
                    lukkKnapp: false,
                    actions: [
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
                        </FTButton>,
                        <FTButton
                            variant="primary"
                            key={'bekreft'}
                            onClick={() => {
                                onBekreft(behandling.behandlingId);
                            }}
                            size="small"
                        >
                            Bekreft
                        </FTButton>,
                    ],
                }}
                modelStyleProps={{
                    width: '25rem',
                    minHeight: '15rem',
                }}
            >
                <SkjemaGruppe feil={hentFrontendFeilmelding(skjema.submitRessurs)}>
                    {feilmelding && feilmelding !== '' && (
                        <BodyLong size="small">{feilmelding}</BodyLong>
                    )}
                    <FixedDatovelger
                        {...skjema.felter.tidsfrist.hentNavBaseSkjemaProps(skjema.visFeilmeldinger)}
                        id={'frist'}
                        label={'Frist'}
                        onChange={(nyVerdi?: string) =>
                            skjema.felter.tidsfrist.onChange(nyVerdi ? nyVerdi : '')
                        }
                        limitations={{ minDate: minTidsfrist(), maxDate: maxTidsfrist() }}
                        placeholder={datoformatNorsk.DATO}
                        valgtDato={skjema.felter.tidsfrist.verdi}
                        feil={
                            ugyldigDatoValgt ? skjema.felter.tidsfrist.feilmelding?.toString() : ''
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
                </SkjemaGruppe>
            </UIModalWrapper>
        </>
    );
};

export default SettBehandlingPåVent;
