import * as React from 'react';

import { styled } from 'styled-components';

import { Alert, BodyLong, BodyShort, Heading, Loader } from '@navikt/ds-react';
import { ASpacing3 } from '@navikt/ds-tokens/dist/tokens';
import { RessursStatus } from '@navikt/familie-typer';

import { useFeilutbetalingForeldelse } from './FeilutbetalingForeldelseContext';
import FeilutbetalingForeldelsePerioder from './ForeldelsePeriode/FeilutbetalingForeldelsePerioder';
import { useBehandling } from '../../../context/BehandlingContext';
import { IBehandling } from '../../../typer/behandling';
import { finnDatoRelativtTilNå } from '../../../utils';
import { FTButton, Navigering, Spacer20 } from '../../Felleskomponenter/Flytelementer';
import Steginformasjon from '../../Felleskomponenter/Steginformasjon/StegInformasjon';

export const getDate = (): string => {
    return finnDatoRelativtTilNå({ months: -30 });
};

const StyledForeldelse = styled.div`
    padding: ${ASpacing3};
`;

const StyledAutomatiskForeldelse = styled.div`
    padding: ${ASpacing3};
    min-width: 15rem;
    max-width: 30rem;
`;

const HenterContainer = styled(StyledForeldelse)`
    text-align: center;
`;

interface IProps {
    behandling: IBehandling;
}

const ForeldelseContainer: React.FC<IProps> = ({ behandling }) => {
    const {
        feilutbetalingForeldelse,
        skjemaData,
        stegErBehandlet,
        erAutoutført,
        gåTilNeste,
        gåTilForrige,
    } = useFeilutbetalingForeldelse();
    const { behandlingILesemodus } = useBehandling();
    const erLesevisning = !!behandlingILesemodus || !!erAutoutført;

    if (erAutoutført) {
        return (
            <StyledAutomatiskForeldelse>
                <Heading spacing size="small" level="2">
                    Foreldelse
                </Heading>
                <BodyShort size="small" spacing>
                    Foreldelsesloven §§ 2 og 3
                </BodyShort>
                <BodyLong size="small" spacing>
                    Automatisk vurdert
                </BodyLong>
                <Navigering>
                    <FTButton variant="primary" onClick={gåTilNeste}>
                        Neste
                    </FTButton>
                    <FTButton variant="secondary" onClick={gåTilForrige}>
                        Forrige
                    </FTButton>
                </Navigering>
            </StyledAutomatiskForeldelse>
        );
    }

    switch (feilutbetalingForeldelse?.status) {
        case RessursStatus.SUKSESS:
            return (
                <StyledForeldelse>
                    <Heading spacing size="small" level="2">
                        Foreldelse
                    </Heading>
                    {(!erLesevisning || stegErBehandlet) && (
                        <>
                            <Steginformasjon
                                behandletSteg={stegErBehandlet}
                                infotekst={`Perioden før ${getDate()} kan være foreldet. Del opp perioden ved behov og
                                fastsett foreldelse`}
                            />
                            <Spacer20 />
                        </>
                    )}
                    {skjemaData.length > 0 && (
                        <FeilutbetalingForeldelsePerioder
                            behandling={behandling}
                            perioder={skjemaData}
                            erLesevisning={erLesevisning}
                        />
                    )}
                </StyledForeldelse>
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
            return (
                <Alert variant="error" children={feilutbetalingForeldelse.frontendFeilmelding} />
            );
        default:
            return <div />;
    }
};

export default ForeldelseContainer;
