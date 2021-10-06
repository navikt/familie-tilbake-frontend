# familie-tilbake-frontend
====================

Saksbehandlerapplikasjon for tilbakekreving av ytelsene barnetrygd, konstantstøtte og støtte til enslig forsørgere

# Kom i gang med utvikling

* Installere avhengigheter `yarn`
* Starte dev-server `yarn start:dev`
* Åpne `http://localhost:8000` i nettleseren din

Appen krever at applikasjonene [familie-tilbake](https://github.com/navikt/familie-tilbake) og [familie-historikk](https://github.com/navikt/familie-historikk) kjører lokalt.

Appen krever en del environment variabler og legges til i .env fila i root på prosjektet. Disse verdiene kan hentes fra vault i .env-lokalt i katalogen preprod/dev-fss/familie-tilbake.

```
    COOKIE_KEY1='<any string of length 32>'
    COOKIE_KEY2='<any string of length 32>'
    SESSION_SECRET='<any string of length 32>'
    
    CLIENT_ID='<application_id from aad app>'
    CLIENT_SECRET='<KEY from aad app>'
    FAMILIE_TILBAKE_CLIENT_ID=<familie-tilbake client ID>
    FAMILIE_HISTORIKK_CLIENT_ID=<familie-historikk client ID>

    ENV=local
    APP_VERSION=0.0.1
```

---
# Henvendelser
## For NAV-ansatte

Interne henvendelser kan sendes via Slack i kanalen #team-familie.
