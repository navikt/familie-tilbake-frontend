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
                            Team Tilbake
                        </Link>{' '}
                        i Seksjon for kontroll og internasjonalt i Ytelsesavdelingen.{' '}
                        <Link
                            href="https://navno.sharepoint.com/sites/intranett-prosjekter-og-satsninger/SitePages/Dette-er-Team-tilbake.aspx"
                            target="_blank"
                        >
                            Mer om Team Tilbake
                        </Link>
                        .
                    </BodyLong>
                </VStack>

                <VStack gap="space-16">
                    <Heading size="large" level="2">
                        Dine rettigheter
                    </Heading>
                    <BodyLong className="flex flex-col">
                        <span>
                            Du har blant annet rett til innsyn i hvilke opplysninger vi har lagret
                            om deg. Les mer her om dine rettigheter og hvordan du gjør krav på disse
                            rettighetene.
                        </span>
                        <span>
                            Se{' '}
                            <Link
                                href="https://navno.sharepoint.com/sites/intranett-hr/SitePages/Personvernerkl%C3%A6ring.aspx?or=WORD-WEB.BODY.NT&ct=1790149159702"
                                target="_blank"
                            >
                                Personvernerklæring for ansatte i Arbeids- og velferdsetaten
                            </Link>
                            .
                        </span>
                    </BodyLong>
                </VStack>

                <VStack gap="space-16">
                    <Heading size="large" level="2">
                        Personvernombudet
                    </Heading>
                    <BodyLong>
                        Arbeids- og velferdsetaten har et{' '}
                        <Link href="https://www.nav.no/personvern" target="_blank">
                            personvernombud
                        </Link>{' '}
                        som skal ivareta personverninteressene, også til de ansatte.
                        Personvernombudet kan gi råd og veiledning generelt om Navs behandling av
                        personopplysninger og kan hjelpe deg med å ivareta dine
                        personverninteresser.
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

                <VStack gap="space-16">
                    <Heading size="large" level="2">
                        Særskilt om bruk av “Innblikk”
                    </Heading>
                    <BodyLong className="flex flex-col gap-6">
                        <span>
                            Innblikk brukes av{' '}
                            <Link
                                href="https://teamkatalogen.nav.no/team/6addf9ae-9533-4ce9-9336-3cfd97146cdd"
                                target="_blank"
                            >
                                Team Tilbake
                            </Link>{' '}
                            for å måle saksbehandleradferd.{' '}
                            <span className="font-semibold">Målingene er anonymiserte</span>, og kan
                            ikke kobles til en konkret saksbehandler. Målingene er verdifulle, de
                            gir innsikt og læring til Team Tilbake. På denne måten kan løsningen
                            videreutvikles basert på bruksmønstre.
                        </span>
                        <span>
                            Eksempler på målinger er navigasjon eller hvor lang tid saksbehandler
                            bruker per steg i Tilbakeløsningen. Dette med hensikt om å gjøre
                            løsningen mer brukervennlig, effektiv og sikre god kvalitet i
                            sakbehandling av tilbakekrevingssaker.
                        </span>
                    </BodyLong>
                </VStack>

                <VStack gap="space-16">
                    <Heading size="large" level="2">
                        Hva er Innblikk?
                    </Heading>
                    <BodyLong>
                        Innblikk (Umami) gir statistikk og analyse av hvordan innblikk.ansatt.nav.no
                        brukes. Innblikk bruker ikke informasjonskapsler, men henter inn
                        opplysninger om nettleseren din for å lage en unik ID. Denne ID-en brukes
                        for å skille deg fra andre brukere. For å hindre identifisering, bruker vi
                        en egenutviklet proxy som vasker bort deler av IP-adressen din før dataene
                        sendes til verktøyet.
                    </BodyLong>
                </VStack>

                <VStack gap="space-16">
                    <Heading size="large" level="2">
                        Auditlogging i Innblikk
                    </Heading>
                    <BodyLong className="flex flex-col gap-6">
                        <span>
                            Når{' '}
                            <Link
                                href="https://teamkatalogen.nav.no/team/6addf9ae-9533-4ce9-9336-3cfd97146cdd"
                                target="_blank"
                            >
                                Team Tilbake
                            </Link>{' '}
                            bruker målingsverktøyet Innblikk så logger Innblikk Nav-identen til den
                            i teamet som kjører spørringer. Dette gjør at Team ResearchOPS kan logge
                            hvem som har kjørt hvilke spørringer, og er en del av deres
                            sikkerhetsrutine for å beskytte data innsamlet med målingsverktøyet
                            Innblikk.
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
                            personopplysningloven. Hjemmelen for denne behandlingen er
                            personvernforordningen artikkel 32.
                        </span>
                    </BodyLong>
                </VStack>

                <VStack gap="space-16">
                    <Heading size="large" level="2">
                        Om retten til å protestere
                    </Heading>
                    <BodyLong className="flex flex-col gap-6">
                        <span>
                            Som saksbehandler i Tilbakeløsningen utfører du oppgaver som Nav er
                            pålagt gjennom folketrygdloven § 22-15, Nav-loven § 4a mv.
                            Behandlingsgrunnlaget vi bruker for å behandle ansattes
                            personopplysninger i denne sammenheng er personvernforordningen artikkel
                            6 (1) bokstav e som tillater behandling av personopplysninger for å
                            utøve offentlig myndighet.
                        </span>
                        <span>
                            Dette behandlingsgrunnlaget gir den registrerte (den personopplysningene
                            gjelder) rett til å protestere mot behandlingen etter
                            personvernforordningen artikkel 21. Det betyr at du kan protestere mot
                            behandlingen vi gjør av dine personopplysninger i brukeratferdsverktøyet
                            Innblikk.
                        </span>
                        <span>
                            Ved en protest ber vi om at du som saksbehandler argumentere for at det
                            er grunner knyttet til din særlige situasjon som tilsier at behandlingen
                            må stanses.
                        </span>
                        <span>
                            <Link
                                href="https://teamkatalogen.nav.no/team/6addf9ae-9533-4ce9-9336-3cfd97146cdd"
                                target="_blank"
                            >
                                Team Tilbake
                            </Link>{' '}
                            vil da stanse behandlingen, med mindre det foreligger tvingende
                            berettigede grunner for behandlingen som går foran dine interesser,
                            rettigheter og friheter, jf. personvernforordningen artikkel 21.
                        </span>
                        <span>
                            Protesten kan sendes til{' '}
                            <Link href="mailto:nav.ytelsesavdelingen.kontroll.og.internasjonalt@nav.no">
                                nav.ytelsesavdelingen.kontroll.og.internasjonalt@nav.no
                            </Link>{' '}
                            med din nærmeste leder på kopi.
                        </span>
                    </BodyLong>
                </VStack>
            </Page.Block>
        </div>
    );
};
