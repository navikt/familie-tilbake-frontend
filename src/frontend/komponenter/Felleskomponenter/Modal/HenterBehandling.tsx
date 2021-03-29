import * as React from 'react';

import navFarger from 'nav-frontend-core';
import { Column, Row } from 'nav-frontend-grid';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Normaltekst } from 'nav-frontend-typografi';

import UIModalWrapper from './UIModalWrapper';

const HenterBehandling: React.FC = () => {
    return (
        <UIModalWrapper
            modal={{
                tittel: 'Henter behandling',
                lukkKnapp: false,
                visModal: true,
            }}
            style={{
                overlay: {
                    backgroundColor: navFarger.navGra40,
                },
            }}
        >
            <Row>
                <Column md="10">
                    <Normaltekst>Henting av behandlingen tar litt tid.</Normaltekst>
                    <Normaltekst>Vennligst vent!</Normaltekst>
                </Column>
                <Column md="2">
                    <NavFrontendSpinner type="L" />
                </Column>
            </Row>
        </UIModalWrapper>
    );
};

export default HenterBehandling;
