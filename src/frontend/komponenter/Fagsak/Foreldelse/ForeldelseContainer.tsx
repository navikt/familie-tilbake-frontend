import { Alert, BodyLong, Heading, Link, VStack } from '@navikt/ds-react';
import * as React from 'react';

import { useForeldelse } from './ForeldelseContext';
import ForeldelsePerioder from './ForeldelsePeriode/ForeldelsePerioder';
import { useBehandling } from '../../../context/BehandlingContext';
import { Behandlingssteg } from '../../../typer/behandling';
import { RessursStatus } from '../../../typer/ressurs';
import { finnDatoRelativtTilNå } from '../../../utils';
import DataLastIkkeSuksess from '../../Felleskomponenter/Datalast/DataLastIkkeSuksess';
import { ActionBar } from '../ActionBar/ActionBar';

const ForeldelseContainer: React.FC = () => {
    const {
        foreldelse,
        skjemaData,
        erAutoutført,
        gåTilNesteSteg,
        gåTilForrigeSteg,
        stegErBehandlet,
        sendInnSkjema,
        senderInn,
        allePerioderBehandlet,
    } = useForeldelse();
    const { behandling, behandlingILesemodus, actionBarStegtekst } = useBehandling();
    const erLesevisning = !!behandlingILesemodus || !!erAutoutført;
    const navigerEllerLagreOgNaviger =
        erAutoutført || (stegErBehandlet && erLesevisning) ? gåTilNesteSteg : sendInnSkjema;

    return (
        <>
            <Heading size="small" level="1" spacing>
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
                                    className="text-ax-text-accent-subtle"
                                >
                                    § 2
                                </Link>{' '}
                                og{' '}
                                <Link
                                    href="https://lovdata.no/dokument/NL/lov/1979-05-18-18/KAPITTEL_1#%C2%A73"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-ax-text-accent-subtle"
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
                                        className="text-ax-text-accent-subtle"
                                    >
                                        § 2
                                    </Link>{' '}
                                    og{' '}
                                    <Link
                                        href="https://lovdata.no/dokument/NL/lov/1979-05-18-18/KAPITTEL_1#%C2%A73"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-ax-text-accent-subtle"
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
                        <ForeldelsePerioder perioder={skjemaData} erLesevisning={erLesevisning} />
                    )}
                </>
            ) : (
                <DataLastIkkeSuksess ressurser={[foreldelse]} />
            )}
            <ActionBar
                stegtekst={actionBarStegtekst(Behandlingssteg.Foreldelse)}
                forrigeAriaLabel={
                    behandling.behandlingsstegsinfo.some(
                        steg => steg.behandlingssteg === Behandlingssteg.Forhåndsvarsel
                    )
                        ? 'Gå tilbake til forhåndsvarselsteget'
                        : 'Gå tilbake til faktasteget'
                }
                nesteAriaLabel="Gå videre til vilkårsvurderingssteget"
                onForrige={gåTilForrigeSteg}
                onNeste={navigerEllerLagreOgNaviger}
                disableNeste={!allePerioderBehandlet}
                isLoading={senderInn}
            />
        </>
    );
};

export default ForeldelseContainer;
