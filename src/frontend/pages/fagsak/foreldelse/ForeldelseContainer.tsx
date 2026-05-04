import type { FC } from 'react';

import { BodyLong, Heading, Link, LocalAlert, VStack } from '@navikt/ds-react';

import { useBehandling } from '~/context/BehandlingContext';
import { useBehandlingState } from '~/context/BehandlingStateContext';
import { ActionBar } from '~/komponenter/action-bar/ActionBar';
import { DataLastIkkeSuksess } from '~/komponenter/datalast/DataLastIkkeSuksess';
import { RessursStatus } from '~/typer/ressurs';
import { finnDatoRelativtTilNå } from '~/utils';

import { ForeldelsePerioder } from './foreldelse-periode/ForeldelsePerioder';
import { useForeldelse } from './ForeldelseContext';

const forrigeAriaLabel = (finnesForhåndsvarsel: boolean, skalLagre: boolean): string => {
    if (finnesForhåndsvarsel && skalLagre) {
        return 'Lagre og gå tilbake til forhåndsvarselsteget';
    } else if (!finnesForhåndsvarsel && skalLagre) {
        return 'Lagre og gå tilbake til faktasteget';
    } else if (finnesForhåndsvarsel && !skalLagre) {
        return 'Gå tilbake til forhåndsvarselsteget';
    } else {
        return 'Gå tilbake til faktasteget';
    }
};

export const ForeldelseContainer: FC = () => {
    const {
        foreldelse,
        skjemaData,
        erAutoutført,
        navigerTilNeste,
        navigerTilForrige,
        stegErBehandlet,
        sendInnSkjema,
        senderInn,
        allePerioderBehandlet,
        harUlagredeEndringer,
    } = useForeldelse();
    const behandling = useBehandling();
    const { behandlingILesemodus, actionBarStegtekst } = useBehandlingState();

    const skalNavigere =
        !harUlagredeEndringer || erAutoutført || (stegErBehandlet && behandlingILesemodus);
    const onNeste = skalNavigere ? navigerTilNeste : (): void => sendInnSkjema(navigerTilNeste);
    const onForrige = skalNavigere
        ? navigerTilForrige
        : (): void => sendInnSkjema(navigerTilForrige);
    const finnesForhåndsvarsel = behandling.behandlingsstegsinfo.some(
        steg => steg.behandlingssteg === 'FORHÅNDSVARSEL'
    );

    return (
        <VStack gap="space-24">
            <Heading size="medium">Foreldelse</Heading>
            {erAutoutført ? (
                <LocalAlert status="success" className="min-w-80" size="small">
                    <LocalAlert.Header>
                        <LocalAlert.Title as="h3">Perioden er ikke foreldet</LocalAlert.Title>
                    </LocalAlert.Header>
                    <LocalAlert.Content>
                        <VStack gap="space-24">
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
                    </LocalAlert.Content>
                </LocalAlert>
            ) : foreldelse?.status === RessursStatus.Suksess ? (
                <>
                    {behandling.erNyModell ? null : (
                        <LocalAlert status="announcement" className="min-w-80" size="small">
                            <LocalAlert.Header>
                                <LocalAlert.Title as="h3">
                                    Perioden før {finnDatoRelativtTilNå({ months: -30 })} kan være
                                    foreldet
                                </LocalAlert.Title>
                            </LocalAlert.Header>
                            <LocalAlert.Content>
                                <BodyLong>
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
                            </LocalAlert.Content>
                        </LocalAlert>
                    )}

                    {skjemaData.length > 0 && <ForeldelsePerioder perioder={skjemaData} />}
                </>
            ) : (
                <DataLastIkkeSuksess ressurser={[foreldelse]} />
            )}
            <ActionBar
                stegtekst={actionBarStegtekst('FORELDELSE')}
                forrigeAriaLabel={forrigeAriaLabel(finnesForhåndsvarsel, !skalNavigere)}
                nesteAriaLabel={
                    skalNavigere
                        ? 'Gå videre til vilkårsvurderingssteget'
                        : 'Lagre og gå videre til vilkårsvurderingssteget'
                }
                onForrige={onForrige}
                onNeste={onNeste}
                nesteTekst={skalNavigere ? 'Neste' : 'Lagre og gå til neste'}
                forrigeTekst={skalNavigere ? 'Forrige' : 'Lagre og gå til forrige'}
                disableNeste={!allePerioderBehandlet}
                isLoading={senderInn}
            />
        </VStack>
    );
};
