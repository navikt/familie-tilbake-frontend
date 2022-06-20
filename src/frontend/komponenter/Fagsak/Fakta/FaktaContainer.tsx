import * as React from 'react';

import styled from 'styled-components';

import AlertStripe from 'nav-frontend-alertstriper';
import navFarger from 'nav-frontend-core';
import { Undertittel } from 'nav-frontend-typografi';

import { BodyLong, Loader } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';

import { useBehandling } from '../../../context/BehandlingContext';
import { Ytelsetype } from '../../../kodeverk';
import { Spacer20 } from '../../Felleskomponenter/Flytelementer';
import Steginformasjon from '../../Felleskomponenter/Steginformasjon/StegInformasjon';
import FaktaSkjema from './FaktaSkjema';
import { useFeilutbetalingFakta } from './FeilutbetalingFaktaContext';

const StyledFeilutbetalingFakta = styled.div`
    padding: 10px;

    .typo-undertekst {
        margin-bottom: 10px;
    }

    .redText {
        color: ${navFarger.navRod};
        font-weight: bold;
    }
`;

const HenterContainer = styled(StyledFeilutbetalingFakta)`
    text-align: center;
`;

interface IProps {
    ytelse: Ytelsetype;
}

const FaktaContainer: React.FC<IProps> = ({ ytelse }) => {
    const { stegErBehandlet, skjemaData, feilutbetalingFakta } = useFeilutbetalingFakta();
    const { behandlingILesemodus } = useBehandling();
    const erLesevisning = !!behandlingILesemodus;

    switch (feilutbetalingFakta?.status) {
        case RessursStatus.SUKSESS:
            return (
                <StyledFeilutbetalingFakta>
                    <Undertittel>Fakta om feilutbetaling</Undertittel>
                    <Spacer20 />
                    {(!erLesevisning || stegErBehandlet) && (
                        <>
                            <Steginformasjon
                                behandletSteg={stegErBehandlet}
                                infotekst={'Kontroller at korrekt hendelse er satt'}
                            />
                            <Spacer20 />
                        </>
                    )}
                    <FaktaSkjema
                        skjemaData={skjemaData}
                        feilutbetalingFakta={feilutbetalingFakta.data}
                        ytelse={ytelse}
                        erLesevisning={erLesevisning}
                    />
                </StyledFeilutbetalingFakta>
            );
        case RessursStatus.HENTER:
            return (
                <HenterContainer>
                    <BodyLong>Henting av feilutbetalingen tar litt tid.</BodyLong>
                    <Loader
                        size="2xlarge"
                        title="henter..."
                        transparent={false}
                        variant="neutral"
                    />
                </HenterContainer>
            );
        case RessursStatus.FEILET:
        case RessursStatus.FUNKSJONELL_FEIL:
            return <AlertStripe children={feilutbetalingFakta.frontendFeilmelding} type="feil" />;
        default:
            return <div />;
    }
};

export default FaktaContainer;
