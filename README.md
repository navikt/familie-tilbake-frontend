# familie-tilbake-frontend
====================

Saksbehandlerapplikasjon for tilbakekreving av ytelsene barnetrygd, konstantstøtte og støtte til enslig forsørgere

# Kom i gang med utvikling

* Installere avhengigheter `yarn`
* Starte dev-server `yarn start:dev`
* Åpne `http://localhost:8000` i nettleseren din

Appen krever at applikasjonene [familie-tilbake](https://github.com/navikt/familie-tilbake) og [familie-historikk](https://github.com/navikt/familie-historikk) kjører lokalt.

Appen krever en del environment variabler og legges til i .env fila i root på prosjektet.
```
    COOKIE_KEY1='<any string of length 32>'
    COOKIE_KEY2='<any string of length 32>'
    SESSION_SECRET='<any string of length 32>'
    
    CLIENT_ID='<AZURE_APP_CLIENT_ID fra secret>'
    CLIENT_SECRET='<AZURE_APP_CLIENT_ID fra secret>'
    FAMILIE_TILBAKE_CLIENT_ID=<AZURE_APP_CLIENT_ID fra secret til azuread-familie-tilbake-lokal>
    FAMILIE_HISTORIKK_CLIENT_ID=<AZURE_APP_CLIENT_ID fra secret til azuread-familie-historikk-lokal>

    ENV=local
    APP_VERSION=0.0.1
```
Verdiene til disse variablene kan hentes ut fra cluster med kommandoene:
```
kubectl -n teamfamilie get secret azuread-familie-tilbake-frontend-lokal -o json | jq '.data | map_values(@base64d)'

kubectl -n teamfamilie get secret azuread-familie-tilbake-lokal -o json | jq '.data | map_values(@base64d)'

kubectl -n teamfamilie get secret azuread-familie-historikk-lokal -o json | jq '.data | map_values(@base64d)'
```
#
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

---
# Henvendelser
Spørsmål knyttet til koden eller prosjektet kan rettes til:

* Henning Solberg, `henning.solberg@nav.no`
* Geir Roger Moen, `geir.roger.moen@nav.no`

## For NAV-ansatte

Interne henvendelser kan sendes via Slack i kanalen #team-familie-tilbakekreving eller kanalen #team-familie.