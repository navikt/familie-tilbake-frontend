import React from 'react';

import styled from 'styled-components';

import { Fieldset, Heading, Modal } from '@navikt/ds-react';
import { FamilieSelect } from '@navikt/familie-form-elements';

import { MottakerType, mottakerTypeVisningsnavn } from '../../../typer/Brevmottaker';
import { useBrevmottaker } from './BrevmottakerContext';

const StyledModal = styled(Modal)`
    width: 35rem;
`;

const StyledFieldset = styled(Fieldset)`
    // &.navds-fieldset > div:not(:first-of-type):not(:empty) {
    //     margin-top: $ {ASpacing6};
    // }
`;

const MottakerSelect = styled(FamilieSelect)`
    max-width: 19rem;
`;

interface Props {
    visModal: boolean;
    lukkModal: () => void;
    brevmottakerId?: string;
}

// @ts-ignore
export const LeggTilEndreBrevmottakerModal: React.FC<Props> = ({
    visModal,
    lukkModal,
    brevmottakerId,
}: Props) => {
    const heading = !brevmottakerId ? 'Legg til brevmottaker' : 'Endre brevmottaker';
    const { skjema } = useBrevmottaker();

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return (
        <StyledModal
            open={visModal}
            aria-label={heading}
            onClose={lukkModal}
            shouldCloseOnOverlayClick={false}
        >
            <Heading spacing level="2" size="medium" id="modal-heading">
                {heading}
            </Heading>
            <StyledFieldset legend="Skjema for å legge til eller fjerne brevmottaker" hideLegend>
                <MottakerSelect
                    {...skjema.felter.mottaker.hentNavBaseSkjemaProps(skjema.visFeilmeldinger)}
                    //erLesevisning={erLesevisning}
                    label="Mottaker"
                    onChange={(event): void => {
                        skjema.felter.mottaker.validerOgSettFelt(
                            event.target.value as MottakerType
                        );
                    }}
                >
                    <option value="">Velg</option>
                    {Object.values(MottakerType)
                        .filter(type => type !== MottakerType.BRUKER)
                        .map(mottaker => (
                            <option value={mottaker} key={mottaker}>
                                {mottakerTypeVisningsnavn[mottaker]}
                            </option>
                        ))}
                </MottakerSelect>
            </StyledFieldset>
        </StyledModal>
    );
};
