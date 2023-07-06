import * as React from 'react';

import { ErrorMessage } from '@navikt/ds-react';
import { FamilieSelect } from '@navikt/familie-form-elements';

import { useOpprettBehandlingSkjema } from './OpprettBehandlingSkjemaContext';
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
import {
    BehandlingsMenyButton,
    FTButton,
    Spacer20,
    Spacer8,
} from '../../../../Felleskomponenter/Flytelementer';
import UIModalWrapper from '../../../../Felleskomponenter/Modal/UIModalWrapper';

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

    const feilmelding = hentFrontendFeilmelding(skjema.submitRessurs);

    return (
        <>
            <BehandlingsMenyButton
                variant="tertiary"
                onClick={() => {
                    settVisModal(true);
                    onListElementClick();
                }}
                disabled={!behandling.kanRevurderingOpprettes}
            >
                Opprett behandling
            </BehandlingsMenyButton>

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
                <>
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
                    {feilmelding && (
                        <>
                            <Spacer8 />
                            <div className="skjemaelement__feilmelding">
                                <ErrorMessage size="small">{feilmelding}</ErrorMessage>
                            </div>
                        </>
                    )}
                </>
            </UIModalWrapper>
        </>
    );
};

export default OpprettBehandling;
