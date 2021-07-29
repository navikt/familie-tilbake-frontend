import * as React from 'react';

import KnappBase, { Flatknapp, Knapp } from 'nav-frontend-knapper';

import { IBehandling } from '../../../../../typer/behandling';
import UIModalWrapper from '../../../../Felleskomponenter/Modal/UIModalWrapper';

interface IProps {
    behandling: IBehandling;
    onListElementClick: () => void;
}

const OpprettFjernVerge: React.FC<IProps> = ({ behandling, onListElementClick }) => {
    const [visModal, settVisModal] = React.useState<boolean>(false);

    return (
        <>
            <KnappBase
                mini={true}
                onClick={() => {
                    settVisModal(true);
                    onListElementClick();
                }}
            >
                {behandling.harVerge ? 'Fjern verge/fullmektig' : 'Opprett verge/fullmektig'}
            </KnappBase>

            <UIModalWrapper
                modal={{
                    tittel: behandling.harVerge
                        ? 'Fjern verge/fullmektig?'
                        : 'Opprett verge/fullmektig?',
                    visModal: visModal,
                    lukkKnapp: false,
                    actions: [
                        <Flatknapp
                            key={'avbryt'}
                            onClick={() => {
                                settVisModal(false);
                            }}
                            mini={true}
                        >
                            Avbryt
                        </Flatknapp>,
                        <Knapp type={'hoved'} key={'bekreft'} onClick={() => ({})} mini={true}>
                            Ok
                        </Knapp>,
                    ],
                }}
                style={{
                    content: {
                        width: '20rem',
                        minHeight: '10rem',
                    },
                }}
            ></UIModalWrapper>
        </>
    );
};

export default OpprettFjernVerge;
