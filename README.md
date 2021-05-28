# familie-tilbake-frontend
====================

Saksbehandlerapplikasjon for tilbakekreving av ytelsene barnetrygd, konstantstøtte og støtte til enslig forsørgere

# Kom i gang med utvikling

* Installere avhengigheter `yarn`
* Starte dev-server `yarn start:dev`
* Åpne `http://localhost:8000` i nettleseren din

Appen krever en del environment variabler og legges til i .env fila i root på prosjektet. 

**_INFO:_** Dei første 6 brukes ikke ennå og innholdet kan være hva som helst.
```
    CLIENT_ID='<application_id from aad app>'
    CLIENT_SECRET='<KEY from aad app>'
    COOKIE_KEY1='<any string of length 32>'
    COOKIE_KEY2='<any string of length 32>'
    
    SESSION_SECRET='<any string of length 32>'
    FAMILIE_TILBAKE_SCOPE=api://<familie-tilbake client ID>/.default
    FAMILIE_HISTORIKK_SCOPE=api://<familie-historikk client ID>/.default

    ENV=local
    APP_VERSION=0.0.1
```

---
# Henvendelser
## For NAV-ansatte

Interne henvendelser kan sendes via Slack i kanalen #team-familie.