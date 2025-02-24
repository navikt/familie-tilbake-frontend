import type { IBehandling } from '../../../typer/behandling';

import { BodyLong, BodyShort, Button, Heading } from '@navikt/ds-react';
import { ASpacing3 } from '@navikt/ds-tokens/dist/tokens';
import * as React from 'react';
import { styled } from 'styled-components';

import { useFeilutbetalingForeldelse } from './FeilutbetalingForeldelseContext';
import FeilutbetalingForeldelsePerioder from './ForeldelsePeriode/FeilutbetalingForeldelsePerioder';
import { useBehandling } from '../../../context/BehandlingContext';
import { RessursStatus } from '../../../typer/ressurs';
import { finnDatoRelativtTilNå } from '../../../utils';
import DataLastIkkeSuksess from '../../Felleskomponenter/Datalast/DataLastIkkeSuksess';
import { Navigering, Spacer20 } from '../../Felleskomponenter/Flytelementer';
import Steginformasjon from '../../Felleskomponenter/Steginformasjon/StegInformasjon';

const getDate = (): string => {
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

interface IProps {
    behandling: IBehandling;
}

const ForeldelseContainer: React.FC<IProps> = ({ behandling }) => {
    const {
        feilutbetalingForeldelse,
        skjemaData,
        stegErBehandlet,
        erAutoutført,
        gåTilNesteSteg,
        gåTilForrigeSteg,
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
                    <Button variant="primary" onClick={gåTilNesteSteg}>
                        Neste
                    </Button>
                    <Button variant="secondary" onClick={gåTilForrigeSteg}>
                        Forrige
                    </Button>
                </Navigering>
            </StyledAutomatiskForeldelse>
        );
    }

    if (feilutbetalingForeldelse?.status === RessursStatus.SUKSESS) {
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
    } else {
        return <DataLastIkkeSuksess ressurser={[feilutbetalingForeldelse]} />;
    }
};

export default ForeldelseContainer;
