import * as React from 'react';

import styled from 'styled-components';

import { Alert, BodyLong, Heading, Loader } from '@navikt/ds-react';
import { AFontWeightBold, ATextDanger, ASpacing3 } from '@navikt/ds-tokens/dist/tokens';
import { RessursStatus } from '@navikt/familie-typer';

import { useBehandling } from '../../../context/BehandlingContext';
import { Ytelsetype } from '../../../kodeverk';
import { Spacer20 } from '../../Felleskomponenter/Flytelementer';
import Steginformasjon from '../../Felleskomponenter/Steginformasjon/StegInformasjon';
import FaktaSkjema from './FaktaSkjema';
import { useFeilutbetalingFakta } from './FeilutbetalingFaktaContext';

const StyledFeilutbetalingFakta = styled.div`
    padding: ${ASpacing3};

    .redText {
        color: ${ATextDanger};
        font-weight: ${AFontWeightBold};
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
                    <Heading level="2" size="small" spacing>
                        Fakta om feilutbetaling
                    </Heading>
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
            return <Alert children={feilutbetalingFakta.frontendFeilmelding} variant="error" />;
        default:
            return <div />;
    }
};

export default FaktaContainer;
