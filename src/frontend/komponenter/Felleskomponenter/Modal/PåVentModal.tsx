import * as React from 'react';

import { Knapp } from 'nav-frontend-knapper';
import { Normaltekst, UndertekstBold } from 'nav-frontend-typografi';

import UIModalWrapper from './UIModalWrapper';
import { IBehandlingsstegstilstand, venteårsaker } from '../../../typer/behandling';

interface IProps {
    venteÅrsak?: IBehandlingsstegstilstand;
    onClose: () => void;
}

const PåVentModal: React.FC<IProps> = ({ venteÅrsak, onClose }) => {
    return (
        <UIModalWrapper
            modal={{
                tittel: 'Behandling satt på vent',
                visModal: true,
                lukkKnapp: false,
                actions: [<Knapp onClick={() => onClose()}>Lukk</Knapp>],
            }}
        >
            <>
                {venteÅrsak?.venteårsak && (
                    <>
                        <UndertekstBold>Grunn</UndertekstBold>
                        <Normaltekst>{venteårsaker[venteÅrsak.venteårsak]}</Normaltekst>
                    </>
                )}
            </>
        </UIModalWrapper>
    );
};

export default PåVentModal;
