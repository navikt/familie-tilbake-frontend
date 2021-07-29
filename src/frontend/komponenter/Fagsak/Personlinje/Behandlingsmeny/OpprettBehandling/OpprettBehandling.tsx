import * as React from 'react';

import KnappBase, { Flatknapp, Knapp } from 'nav-frontend-knapper';

import { FamilieSelect } from '@navikt/familie-form-elements';

import {
    Behandlingstype,
    behandlingsTyper,
    behandlingstyper,
    behandlingårsaker,
    behandlingÅrsaker,
    IBehandling,
} from '../../../../../typer/behandling';
import { Spacer20 } from '../../../../Felleskomponenter/Flytelementer';
import UIModalWrapper from '../../../../Felleskomponenter/Modal/UIModalWrapper';
import { useOpprettBehandlingSkjema } from './OpprettBehandlingSkjemaContext';

interface IProps {
    behandling: IBehandling;
    onListElementClick: () => void;
}

const OpprettBehandling: React.FC<IProps> = ({ onListElementClick }) => {
    const [visModal, settVisModal] = React.useState<boolean>(false);
    const { skjema, sendInn, nullstillSkjema } = useOpprettBehandlingSkjema();

    return (
        <>
            <KnappBase
                mini={true}
                onClick={() => {
                    settVisModal(true);
                    onListElementClick();
                }}
            >
                Opprett behandling
            </KnappBase>

            <UIModalWrapper
                modal={{
                    tittel: 'Opprett behandling',
                    visModal: visModal,
                    lukkKnapp: false,
                    actions: [
                        <Flatknapp
                            key={'avbryt'}
                            onClick={() => {
                                nullstillSkjema();
                                settVisModal(false);
                            }}
                            mini={true}
                        >
                            Avbryt
                        </Flatknapp>,
                        <Knapp
                            type={'hoved'}
                            key={'bekreft'}
                            onClick={() => {
                                sendInn();
                            }}
                        >
                            Ok
                        </Knapp>,
                    ],
                }}
            >
                <FamilieSelect
                    erLesevisning={true}
                    name={'Behandling'}
                    label={'Type behandling'}
                    value={skjema.felter.behandlingstype.verdi}
                    lesevisningVerdi={behandlingstyper[Behandlingstype.REVURDERING_TILBAKEKREVING]}
                >
                    {behandlingsTyper.map(opt => (
                        <option key={opt} value={opt}>
                            {behandlingstyper[opt]}
                        </option>
                    ))}
                </FamilieSelect>
                <Spacer20 />
                <FamilieSelect
                    {...skjema.felter.behandlingsårsak.hentNavBaseSkjemaProps(
                        skjema.visFeilmeldinger
                    )}
                    erLesevisning={false}
                    name={'Behandling'}
                    label={'Årsak til revuderingen'}
                    value={skjema.felter.behandlingsårsak.verdi}
                    onChange={event => skjema.felter.behandlingsårsak.onChange(event)}
                >
                    <option disabled={true} value={''}>
                        Velg årsak til revurderingen
                    </option>
                    {behandlingÅrsaker.map(opt => (
                        <option key={opt} value={opt}>
                            {behandlingårsaker[opt]}
                        </option>
                    ))}
                </FamilieSelect>
            </UIModalWrapper>
        </>
    );
};

export default OpprettBehandling;
