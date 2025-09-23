import type { IBehandling } from '../../../typer/behandling';

import { Alert, BodyLong, Heading, Link, VStack } from '@navikt/ds-react';
import * as React from 'react';

import { useForeldelse } from './ForeldelseContext';
import ForeldelsePerioder from './ForeldelsePeriode/ForeldelsePerioder';
import { useBehandling } from '../../../context/BehandlingContext';
import { RessursStatus } from '../../../typer/ressurs';
import { finnDatoRelativtTilNå } from '../../../utils';
import DataLastIkkeSuksess from '../../Felleskomponenter/Datalast/DataLastIkkeSuksess';
import { ActionBar } from '../ActionBar/ActionBar';

interface Props {
    behandling: IBehandling;
}

const ForeldelseContainer: React.FC<Props> = ({ behandling }) => {
    const {
        foreldelse,
        skjemaData,
        erAutoutført,
        gåTilNesteSteg,
        gåTilForrigeSteg,
        stegErBehandlet,
        sendInnSkjema,
    } = useForeldelse();
    const { behandlingILesemodus, åpenHøyremeny } = useBehandling();
    const erLesevisning = !!behandlingILesemodus || !!erAutoutført;
    const navigerEllerLagreOgNaviger =
        erAutoutført || (stegErBehandlet && erLesevisning) ? gåTilNesteSteg : sendInnSkjema;

    return (
        <VStack
            gap="4"
            className="rounded-2xl bg-white px-6 py-4 border-border-divider border-1 mb-24 min-h-144"
        >
            <Heading size="small" level="1">
                Foreldelse
            </Heading>
            {erAutoutført ? (
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
            ) : foreldelse?.status === RessursStatus.Suksess ? (
                <>
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
                                    <span className="text-nowrap">(6 måneder før)</span>, må
                                    foreldelse vurderes manuelt. Del opp perioden ved behov og
                                    begrunn vurderingen.
                                </BodyLong>
                            </VStack>
                        )}
                    </Alert>
                    {skjemaData.length > 0 && (
                        <ForeldelsePerioder
                            behandling={behandling}
                            perioder={skjemaData}
                            erLesevisning={erLesevisning}
                        />
                    )}
                </>
            ) : (
                <DataLastIkkeSuksess ressurser={[foreldelse]} />
            )}
            <ActionBar
                forrigeTekst="Forrige"
                nesteTekst="Neste"
                forrigeAriaLabel="Gå tilbake til fakta-steget"
                nesteAriaLabel="Gå videre til vilkårsvurderingssteget"
                åpenHøyremeny={åpenHøyremeny}
                onForrige={gåTilForrigeSteg}
                onNeste={navigerEllerLagreOgNaviger}
            />
        </VStack>
    );
};

export default ForeldelseContainer;
