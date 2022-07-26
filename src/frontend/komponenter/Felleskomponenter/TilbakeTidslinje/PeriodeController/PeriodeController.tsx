import * as React from 'react';

import styled from 'styled-components';

import { BackFilled, NextFilled } from '@navikt/ds-icons';
import { Button } from '@navikt/ds-react';

const Controller = styled.div`
    float: right;
`;

const NavigeringsKnapp = styled(Button)`
    margin-left: 5px;
    width: 26px;
    height: 26px;
    min-height: auto;
    min-width: auto;
    padding: 0px;
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
                onClick={(e: MouseEvent) => {
                    e.preventDefault();
                    forrigePeriode();
                }}
                size="small"
            >
                <BackFilled aria-label="Forrige periode" />
            </NavigeringsKnapp>
            <NavigeringsKnapp
                variant="secondary"
                aria-label="Neste periode"
                onClick={(e: MouseEvent) => {
                    e.preventDefault();
                    nestePeriode();
                }}
                size="small"
            >
                <NextFilled aria-label="Neste periode" />
            </NavigeringsKnapp>
        </Controller>
    );
};

export default PeriodeController;
