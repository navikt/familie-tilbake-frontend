import type { FC } from 'react';

import { BodyLong, Heading, Link, Page, VStack } from '@navikt/ds-react';

export const Personvern: FC = () => {
    return (
        <div className="h-[calc(100vh-48px)] overflow-y-auto">
            <div className="bg-ax-bg-brand-blue-soft py-8">
                <Page.Block width="text" gutters>
                    <VStack gap="space-16">
                        <Heading size="xlarge">Personvern</Heading>
                        <BodyLong className="font-semibold">
                            Slik håndterer vi personvern og sikkerhet i Tilbakeløsningen
                        </BodyLong>
                    </VStack>
                </Page.Block>
            </div>

            <Page.Block width="text" className="flex flex-col gap-12 py-12" gutters>
                <VStack gap="space-16">
                    <Heading size="large" level="2">
                        Hva er Tilbakeløsningen?
                    </Heading>
                    <BodyLong>
                        Tilbakeløsningen er et felles system for å tilbakekreve feilutbetalte
                        ytelser og stønader i Nav i tråd med Folketrygdlovens § 22-15. Løsningen
                        utvikles og driftes av{' '}
                        <Link
                            href="https://teamkatalogen.nav.no/team/6addf9ae-9533-4ce9-9336-3cfd97146cdd"
                            target="_blank"
                        >
                            Team tilbake
                        </Link>{' '}
                        i Seksjon for kontroll og internasjonalt i Ytelsesavdelingen.{' '}
                        <Link
                            href="https://navno.sharepoint.com/sites/intranett-prosjekter-og-satsninger/SitePages/Dette-er-Team-tilbake.aspx"
                            target="_blank"
                        >
                            Mer om Team tilbake
                        </Link>
                        .
                    </BodyLong>
                </VStack>

                <VStack gap="space-16">
                    <Heading size="large" level="2">
                        Formålet med audit loggingen
                    </Heading>
                    <BodyLong className="flex flex-col gap-6">
                        <span>
                            Når du bruker målingsverktøyet Innblikk så sender Innblikk din Nav-ident
                            sammen med alle spørringer som kjøres. Dette gjør at vi kan logge hvem
                            som har kjørt hvilke spørringer, og er en del av vår sikkerhetsrutine
                            for å beskytte data innsamlet med målingsverktøyet Innblikk.
                        </span>
                        <span>
                            Loggene brukes kun til statistikk, avvik og sikkerhetsformål.
                            Eksempelvis i forbindelse med avvik for å se hvem som har gjort hvilke
                            spørringer og har hatt tilgang til eventuelle personopplysninger som er
                            innsamlet ved en feil.
                        </span>
                        <span>
                            Personopplysningene dine deles ikke med andre aktører, men vil kunne
                            deles med den registrerte dersom denne ber om innsyn etter
                            personopplysningloven.
                        </span>
                        <span>
                            Hjemmelen for denne behandlingen er personvernforordningen artikkel 32.
                        </span>
                    </BodyLong>
                </VStack>

                <VStack gap="space-16">
                    <Heading size="large" level="2">
                        Innblikk
                    </Heading>
                    <BodyLong>
                        Innblikk brukes til statistikk og analyse av hvordan innblikk.ansatt.nav.no
                        brukes. Unami bruker ikke informasjonskapsler, men henter inn opplysninger
                        om nettleseren din for å lage en unik ID. Denne ID-en brukes for å skille
                        deg fra andre brukere. For å hindre identifisering, bruker vi en
                        egenutviklet proxy som vasker bort deler av IP-adressen din før dataene
                        sendes til verktøyet.
                    </BodyLong>
                </VStack>

                <VStack gap="space-16">
                    <Heading size="large" level="2">
                        Dine rettigheter
                    </Heading>
                    <BodyLong>
                        Du har blant annet rett til innsyn i hvilke opplysninger vi har lagret om
                        deg. Les mer her om dine rettigheter og hvordan du gjør krav på disse{' '}
                        <Link
                            href="https://navno.sharepoint.com/sites/intranett-hr/SitePages/Personvernerkl%C3%A6ring.aspx"
                            target="_blank"
                        >
                            Personvernerklæring for ansatte i Arbeids- og velferdsetaten
                        </Link>
                        .
                    </BodyLong>
                </VStack>

                <VStack gap="space-16">
                    <Heading size="large" level="2">
                        Personvernombudet
                    </Heading>
                    <BodyLong>
                        Arbeids- og velferdsetaten har et{' '}
                        <Link href="https://www.nav.no/personvern" target="_blank">
                            personverninteressene
                        </Link>
                        , også til de ansatte. Personvernombudet kan gi råd og veiledning generelt
                        om Navs behandling av personopplysninger og kan hjelpe deg med å ivareta
                        dine personverninteresser.
                    </BodyLong>
                </VStack>

                <VStack gap="space-16">
                    <Heading size="large" level="2">
                        Klage til Datatilsynet
                    </Heading>
                    <BodyLong>
                        Du har rett til å klage til Datatilsynet hvis du ikke er fornøyd med hvordan
                        vi behandler personopplysninger om deg, eller hvis du mener behandlingen er
                        i strid med personvernreglene. Ta først kontakt med vårt personvernombud.
                        Informasjon om hvordan du går frem finner du på nettsidene til{' '}
                        <Link href="https://www.datatilsynet.no/" target="_blank">
                            Datatilsynet
                        </Link>
                        .
                    </BodyLong>
                </VStack>
            </Page.Block>
        </div>
    );
};
