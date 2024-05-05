# familie-tilbake-frontend

Saksbehandlerapplikasjon for tilbakekreving av ytelsene barnetrygd, konstantstøtte og støtte til enslig forsørgere

# Kom i gang med utvikling

* Installere avhengigheter `yarn`
* Starte dev-server `yarn start:dev`
* Åpne `http://localhost:8000` i nettleseren din

Med default miljøvariabler krever appen at applikasjonen [familie-tilbake](https://github.com/navikt/familie-tilbake) kjører lokalt.
For å generere testdata må du kjøre `familie-tilbake` og kjøre en test i [familie-tilbake-e2e](https://github.com/navikt/familie-tilbake-e2e)

## Miljøvariabler

Miljøvariabler kan genereres ved å kjøre `sh hent-og-lagre-miljøvariabler.sh` (Krever at du er pålogget Naicdevice og er logget inn på google `gcloud auth login`)

Ønsker du å kjøre mot backend i preprod gjøres det med dette i .env fila.
```
ENV=lokalt-mot-preprod
TILBAKE_SCOPE=api://dev-gcp.teamfamilie.familie-tilbake/.default
```

### For Windows-brukere

Applikasjonen kjører ikke på Windows via GitBash as is. En måte å løse det på er å kjøre den via Linux.
Fra og med Windows 10 følge det med eget Subsystem for Linux i Windows.

* Installer Ubuntu fra Microsoft Store
* Sørg for at alle packages er oppdatert  med `sudo apt update` og `sudo apt full-upgrade`
* Installer [Node Version Manager](https://github.com/nvm-sh/nvm#installing-and-updating) (curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash)
* Restart Ubuntu
* Hent siste stabile Nodejs versjon med: `nvm install --lts`
* Clon repoet i ønsket mappe i linux-området med `git clone https://github.com/navikt/familie-ba-sak-frontend.git`
* Legg til .env fila (se beskrivelsen over)

Anbefaler også å laste ned Visual Studio Code fra Microsoft store for å kunne åpne og redigere filene i Linux uten å gå via terminalen. Det gjør det også betydelig lettere å legge til .env fila.

## Henvendelser

Spørsmål knyttet til koden eller prosjektet kan stilles som issues her på GitHub.

## For NAV-ansatte

Interne henvendelser kan sendes via Slack i kanalen #team-familie-tilbakekreving eller kanalen #team-familie.

## Kode generert av GitHub Copilot

Dette repoet bruker GitHub Copilot til å generere kode.
