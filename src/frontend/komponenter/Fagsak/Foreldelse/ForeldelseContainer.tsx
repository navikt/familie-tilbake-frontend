import type { IBehandling } from '../../../typer/behandling';

import { Alert, BodyLong, Button, Heading, Link, VStack } from '@navikt/ds-react';
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
            <VStack padding="4" gap="4">
                <Heading size="small" level="2">
                    Foreldelse
                </Heading>
                <Alert variant="success" className="min-w-80">
                    <Heading spacing size="small" level="3">
                        Perioden er ikke foreldet
                    </Heading>
                    <VStack gap="6">
                        <BodyLong>
                            Ingen perioder er foreldet etter foreldelsesloven{' '}
                            <Link
                                href="https://lovdata.no/dokument/NL/lov/1979-05-18-18/KAPITTEL_1#%C2%A72"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-text-action"
                            >
                                § 2
                            </Link>{' '}
                            og{' '}
                            <Link
                                href="https://lovdata.no/dokument/NL/lov/1979-05-18-18/KAPITTEL_1#%C2%A73"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-text-action"
                            >
                                § 3
                            </Link>
                            .
                        </BodyLong>
                        <BodyLong>
                            Perioden blir automatisk vurdert dersom det er mer enn 6 måneder til den
                            er foreldet.
                        </BodyLong>
                    </VStack>
                </Alert>
                <Navigering>
                    <Button variant="primary" onClick={gåTilNesteSteg}>
                        Neste
                    </Button>
                    <Button variant="secondary" onClick={gåTilForrigeSteg}>
                        Forrige
                    </Button>
                </Navigering>
            </VStack>
        );
    }

    if (feilutbetalingForeldelse?.status === RessursStatus.Suksess) {
        return (
            <StyledForeldelse>
                <Heading spacing size="small" level="2">
                    Foreldelse
                </Heading>
                {(!erLesevisning || stegErBehandlet) && (
                    <>
                        <Steginformasjon
                            behandletSteg={stegErBehandlet}
                            infotekst={`I dette steget må du vurdere foreldelse manuelt. Perioden før ${getDate()} kan være foreldet. Del opp perioden ved behov og
                                fastsett foreldelse.`}
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
