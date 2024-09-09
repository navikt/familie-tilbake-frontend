import * as React from 'react';

import { styled } from 'styled-components';

import { Heading } from '@navikt/ds-react';
import { AFontWeightBold, ATextDanger, ASpacing3 } from '@navikt/ds-tokens/dist/tokens';
import { RessursStatus } from '@navikt/familie-typer';

import FaktaSkjema from './FaktaSkjema';
import { useFeilutbetalingFakta } from './FeilutbetalingFaktaContext';
import { useBehandling } from '../../../context/BehandlingContext';
import { Ytelsetype } from '../../../kodeverk';
import { Spacer20 } from '../../Felleskomponenter/Flytelementer';
import Steginformasjon from '../../Felleskomponenter/Steginformasjon/StegInformasjon';
import DataLastIkkeSuksess from '../../Felleskomponenter/Datalast/DataLastIkkeSuksess';

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

    if (feilutbetalingFakta?.status === RessursStatus.SUKSESS) {
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
    } else {
        return <DataLastIkkeSuksess ressurser={[feilutbetalingFakta]} />;
    }
};

export default FaktaContainer;
