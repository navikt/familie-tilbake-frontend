import * as React from 'react';

import { ErrorMessage } from '@navikt/ds-react';

import { useBehandling } from '../../../../../context/BehandlingContext';
import { IBehandling } from '../../../../../typer/behandling';
import { BehandlingsMenyButton, FTButton } from '../../../../Felleskomponenter/Flytelementer';
import { usePåVentBehandling } from '../../../../Felleskomponenter/Modal/PåVent/PåVentContext';
import UIModalWrapper from '../../../../Felleskomponenter/Modal/UIModalWrapper';

interface IProps {
    behandling: IBehandling;
    onListElementClick: () => void;
}

const GjennoptaBehandling: React.FC<IProps> = ({ behandling, onListElementClick }) => {
    const [visModal, settVisModal] = React.useState<boolean>(false);

    const { hentBehandlingMedBehandlingId } = useBehandling();
    const { feilmelding, onOkTaAvVent } = usePåVentBehandling((suksess: boolean) => {
        settVisModal(false);
        if (suksess) {
            hentBehandlingMedBehandlingId(behandling.behandlingId);
        }
    });

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
                Fortsett behandlingen
            </BehandlingsMenyButton>

            <UIModalWrapper
                modal={{
                    tittel: 'Ta behandlingen av vent?',
                    visModal: visModal,
                    lukkKnapp: false,
                    ariaLabel: 'Gjenoppta behandlingen',
                    actions: [
                        <FTButton
                            variant="tertiary"
                            key={'avbryt'}
                            onClick={() => {
                                settVisModal(false);
                            }}
                            size="small"
                        >
                            Avbryt
                        </FTButton>,
                        <FTButton
                            variant="primary"
                            key={'bekreft'}
                            onClick={() => onOkTaAvVent(behandling.behandlingId)}
                            size="small"
                        >
                            Ok
                        </FTButton>,
                    ],
                }}
                modelStyleProps={{
                    width: '20rem',
                    minHeight: '10rem',
                }}
            >
                <>
                    {feilmelding && feilmelding !== '' && (
                        <div className="skjemaelement__feilmelding">
                            <ErrorMessage size="small">{feilmelding}</ErrorMessage>
                        </div>
                    )}
                </>
            </UIModalWrapper>
        </>
    );
};

export default GjennoptaBehandling;
