import * as React from 'react';

import styled from 'styled-components';

import { Knapp } from 'nav-frontend-knapper';

import { BackFilled, NextFilled } from '@navikt/ds-icons';

const Controller = styled.div`
    float: right;
`;

const NavigeringsKnapp = styled(Knapp)`
    margin-left: 5px;
    width: 24px;
    height: 24px;
    min-height: auto;
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
                onClick={e => {
                    e.preventDefault();
                    forrigePeriode();
                }}
            >
                <BackFilled aria-label="Forrige periode" />
            </NavigeringsKnapp>
            <NavigeringsKnapp
                onClick={e => {
                    e.preventDefault();
                    nestePeriode();
                }}
            >
                <NextFilled aria-label="Neste periode" />
            </NavigeringsKnapp>
        </Controller>
    );
};

export default PeriodeController;
