import * as React from 'react';

import KnappBase from 'nav-frontend-knapper';
import { SkjemaGruppe } from 'nav-frontend-skjema';

import { FamilieSelect } from '@navikt/familie-form-elements';

import {
    Behandlingstype,
    behandlingsTyper,
    behandlingstyper,
    behandlingårsaker,
    behandlingÅrsaker,
    IBehandling,
} from '../../../../../typer/behandling';
import { IFagsak } from '../../../../../typer/fagsak';
import { hentFrontendFeilmelding } from '../../../../../utils/';
import { FTButton, Spacer20 } from '../../../../Felleskomponenter/Flytelementer';
import UIModalWrapper from '../../../../Felleskomponenter/Modal/UIModalWrapper';
import { useOpprettBehandlingSkjema } from './OpprettBehandlingSkjemaContext';

interface IProps {
    behandling: IBehandling;
    fagsak: IFagsak;
    onListElementClick: () => void;
}

const OpprettBehandling: React.FC<IProps> = ({ behandling, fagsak, onListElementClick }) => {
    const [visModal, settVisModal] = React.useState<boolean>(false);
    const { skjema, sendInn, nullstillSkjema } = useOpprettBehandlingSkjema(
        fagsak,
        behandling.behandlingId,
        settVisModal
    );

    return (
        <>
            <KnappBase
                mini={true}
                onClick={() => {
                    settVisModal(true);
                    onListElementClick();
                }}
                disabled={!behandling.kanRevurderingOpprettes}
            >
                Opprett behandling
            </KnappBase>

            <UIModalWrapper
                modal={{
                    tittel: 'Opprett behandling',
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
                                sendInn();
                            }}
                            size="small"
                        >
                            Ok
                        </FTButton>,
                    ],
                }}
            >
                <SkjemaGruppe feil={hentFrontendFeilmelding(skjema.submitRessurs)}>
                    <FamilieSelect
                        erLesevisning={true}
                        name={'Behandling'}
                        label={'Type behandling'}
                        value={skjema.felter.behandlingstype.verdi}
                        lesevisningVerdi={
                            behandlingstyper[Behandlingstype.REVURDERING_TILBAKEKREVING]
                        }
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
                </SkjemaGruppe>
            </UIModalWrapper>
        </>
    );
};

export default OpprettBehandling;
