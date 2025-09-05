import type { IBehandling } from '../../../typer/behandling';

import { Alert, BodyLong, Button, Heading, Link, VStack } from '@navikt/ds-react';
import * as React from 'react';

import { useFeilutbetalingForeldelse } from './FeilutbetalingForeldelseContext';
import FeilutbetalingForeldelsePerioder from './ForeldelsePeriode/FeilutbetalingForeldelsePerioder';
import { useBehandling } from '../../../context/BehandlingContext';
import { RessursStatus } from '../../../typer/ressurs';
import { finnDatoRelativtTilNå } from '../../../utils';
import DataLastIkkeSuksess from '../../Felleskomponenter/Datalast/DataLastIkkeSuksess';
import { Navigering } from '../../Felleskomponenter/Flytelementer';

interface Props {
    behandling: IBehandling;
}

const ForeldelseContainer: React.FC<Props> = ({ behandling }) => {
    const { feilutbetalingForeldelse, skjemaData, erAutoutført, gåTilNesteSteg, gåTilForrigeSteg } =
        useFeilutbetalingForeldelse();
    const { behandlingILesemodus } = useBehandling();
    const erLesevisning = !!behandlingILesemodus || !!erAutoutført;

    if (erAutoutført) {
        return (
            <VStack padding="4" gap="4">
                <Heading size="small" level="2">
                    Foreldelse
                </Heading>
                <Alert variant="success" className="min-w-80">
                    <VStack gap="2">
                        <Heading size="small" level="3">
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
                                Perioden blir automatisk vurdert dersom det er mer enn 6 måneder til
                                den er foreldet.
                            </BodyLong>
                        </VStack>
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
            <VStack padding="4" gap="4">
                <Heading size="small" level="2">
                    Foreldelse
                </Heading>
                <Alert variant="info" className="min-w-80" contentMaxWidth={false}>
                    {behandling.erNyModell ? (
                        <Heading size="small" level="3">
                            Vurder foreldelse
                        </Heading>
                    ) : (
                        <VStack gap="2">
                            <Heading size="small" level="3">
                                Perioden før {finnDatoRelativtTilNå({ months: -30 })} kan være
                                foreldet
                            </Heading>
                            <BodyLong size="medium">
                                Når den alminnelige foreldelsesfristen etter foreldelsesloven{' '}
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
                                </Link>{' '}
                                på 3 år er utløpt eller nærmer seg{' '}
                                <span className="text-nowrap">(6 måneder før)</span>, må foreldelse
                                vurderes manuelt. Del opp perioden ved behov og begrunn vurderingen.
                            </BodyLong>
                        </VStack>
                    )}
                </Alert>

                {skjemaData.length > 0 && (
                    <FeilutbetalingForeldelsePerioder
                        behandling={behandling}
                        perioder={skjemaData}
                        erLesevisning={erLesevisning}
                    />
                )}
            </VStack>
        );
    } else {
        return <DataLastIkkeSuksess ressurser={[feilutbetalingForeldelse]} />;
    }
};

export default ForeldelseContainer;
