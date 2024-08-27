import * as React from 'react';

import { styled } from 'styled-components';

import { Alert, Heading } from '@navikt/ds-react';
import { AFontWeightBold, ATextDanger, ASpacing3 } from '@navikt/ds-tokens/dist/tokens';
import { RessursStatus } from '@navikt/familie-typer';

import FaktaSkjema from './FaktaSkjema';
import { useFeilutbetalingFakta } from './FeilutbetalingFaktaContext';
import { useBehandling } from '../../../context/BehandlingContext';
import { Ytelsetype } from '../../../kodeverk';
import { Spacer20 } from '../../Felleskomponenter/Flytelementer';
import Steginformasjon from '../../Felleskomponenter/Steginformasjon/StegInformasjon';
import HenterData from '../../Felleskomponenter/HenterData/HenterData';

const StyledFeilutbetalingFakta = styled.div`
    padding: ${ASpacing3};

    .redText {
        color: ${ATextDanger};
        font-weight: ${AFontWeightBold};
    }
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
            return <HenterData beskrivelse="Henting av feilutbetalingen tar litt tid." />;
        case RessursStatus.FEILET:
        case RessursStatus.FUNKSJONELL_FEIL:
            return <Alert variant="error">{feilutbetalingFakta.frontendFeilmelding}</Alert>;
        default:
            return <Alert variant="warning">Kunne ikke hente data om feilutbetalingen</Alert>;
    }
};

export default FaktaContainer;
