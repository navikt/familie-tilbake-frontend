import { ChevronLeftIcon, ChevronRightIcon } from '@navikt/aksel-icons';
import { Button } from '@navikt/ds-react';
import * as React from 'react';
import { styled } from 'styled-components';

const Controller = styled.div`
    float: right;
`;

const NavigeringsKnapp = styled(Button)`
    margin-left: 5px;
    width: 26px;
    height: 26px;
    min-height: auto;
    min-width: auto;
    padding: 5px 0 0 0;
`;

interface IProps {
    nestePeriode: () => void;
    forrigePeriode: () => void;
}

const PeriodeController: React.FC<IProps> = ({ nestePeriode, forrigePeriode }) => {
    return (
        <Controller>
            <NavigeringsKnapp
                variant="secondary"
                aria-label="Forrige periode"
                onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    forrigePeriode();
                }}
                size="small"
            >
                <ChevronLeftIcon aria-label="Forrige periode" fontSize="1.3rem" />
            </NavigeringsKnapp>
            <NavigeringsKnapp
                variant="secondary"
                aria-label="Neste periode"
                onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    nestePeriode();
                }}
                size="small"
            >
                <ChevronRightIcon aria-label="Neste periode" fontSize="1.3rem" />
            </NavigeringsKnapp>
        </Controller>
    );
};

export default PeriodeController;
