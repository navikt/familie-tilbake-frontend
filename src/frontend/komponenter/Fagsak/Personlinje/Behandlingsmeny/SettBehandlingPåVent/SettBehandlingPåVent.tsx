import * as React from 'react';

import KnappBase, { Flatknapp, Knapp } from 'nav-frontend-knapper';
import { Normaltekst } from 'nav-frontend-typografi';

import { FamilieSelect } from '@navikt/familie-form-elements';
import { Valideringsstatus } from '@navikt/familie-skjema';

import { useBehandling } from '../../../../../context/BehandlingContext';
import { IBehandling, manuelleÅrsaker, venteårsaker } from '../../../../../typer/behandling';
import { IFagsak } from '../../../../../typer/fagsak';
import { datoformatNorsk } from '../../../../../utils';
import { Spacer20 } from '../../../../Felleskomponenter/Flytelementer';
import { usePåVentBehandling } from '../../../../Felleskomponenter/Modal/PåVent/PåVentContext';
import { settMinDato } from '../../../../Felleskomponenter/Modal/PåVent/PåVentModal';
import UIModalWrapper from '../../../../Felleskomponenter/Modal/UIModalWrapper';
import { FixedDatovelger } from '../../../../Felleskomponenter/Skjemaelementer/';

interface IProps {
    fagsak: IFagsak;
    behandling: IBehandling;
}

const SettBehandlingPåVent: React.FC<IProps> = ({ fagsak, behandling }) => {
    const [visModal, settVisModal] = React.useState<boolean>(false);
    const { hentBehandling } = useBehandling();

    const { skjema, onBekreft, nullstillSkjema, feilmelding } = usePåVentBehandling(
        (suksess: boolean) => {
            settVisModal(false);
            if (suksess) {
                hentBehandling(fagsak, behandling.eksternBrukId);
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
                }}
            >
                Sett behandling på vent
            </KnappBase>

            <UIModalWrapper
                modal={{
                    tittel: 'Sett behandlingen på vent',
                    visModal: visModal,
                    lukkKnapp: false,
                    actions: [
                        <Flatknapp
                            key={'avbryt'}
                            onClick={() => {
                                nullstillSkjema();
                                settVisModal(false);
                            }}
                        >
                            Avbryt
                        </Flatknapp>,
                        <Knapp
                            key={'bekreft'}
                            onClick={() => {
                                onBekreft(behandling.behandlingId);
                            }}
                        >
                            Bekreft
                        </Knapp>,
                    ],
                }}
                style={{
                    content: {
                        width: '25rem',
                        minHeight: '15rem',
                    },
                }}
            >
                <>
                    {feilmelding && feilmelding !== '' && <Normaltekst>{feilmelding}</Normaltekst>}
                    <FixedDatovelger
                        {...skjema.felter.tidsfrist.hentNavBaseSkjemaProps(skjema.visFeilmeldinger)}
                        id={'frist'}
                        label={'Frist'}
                        onChange={(nyVerdi?: string) =>
                            skjema.felter.tidsfrist.onChange(nyVerdi ? nyVerdi : '')
                        }
                        limitations={{ minDate: settMinDato() }}
                        placeholder={datoformatNorsk.DATO}
                        valgtDato={skjema.felter.tidsfrist.verdi}
                        harFeil={ugyldigDatoValgt}
                        feilmelding={
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
                        <option value="-">-</option>
                        {manuelleÅrsaker.map((årsak, index) => (
                            <option key={`årsak_${index}`} value={årsak}>
                                {venteårsaker[årsak]}
                            </option>
                        ))}
                    </FamilieSelect>
                </>
            </UIModalWrapper>
        </>
    );
};

export default SettBehandlingPåVent;
