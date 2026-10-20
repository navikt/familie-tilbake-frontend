#!/bin/bash
set -euo pipefail

LOCALAUTH_URL="https://localauth-tilbake.intern.dev.nav.no"

umask 077

if ! LOGIN_ENV=$(curl --fail --silent --show-error "$LOCALAUTH_URL/entraid/env"); then
  echo "Klarte ikke å hente lokal innloggingskonfigurasjon fra $LOCALAUTH_URL/entraid/env. Se curl-feilen over for detaljer." >&2
  exit 1
fi

if [ -z "$LOGIN_ENV" ]; then
  echo "Localauth returnerte ingen innloggingskonfigurasjon." >&2
  exit 1
fi

printf '%s\n' "$LOGIN_ENV" > .login.env

# Generate random 32 character strings for the cookie and session keys
COOKIE_KEY1=$(openssl rand -hex 16)
COOKIE_KEY2=$(openssl rand -hex 16)
SESSION_SECRET=$(openssl rand -hex 16)

# Write the variables into the .env file
cat << EOF > .env
# Denne filen er generert automatisk ved å kjøre \`hent-og-lagre-miljøvariabler.sh\`

COOKIE_KEY1='$COOKIE_KEY1'
COOKIE_KEY2='$COOKIE_KEY2'
SESSION_SECRET='$SESSION_SECRET'
NAIS_TOKEN_ENDPOINT=http://localhost:4001/api/v1/token
NAIS_TOKEN_EXCHANGE_ENDPOINT=http://localhost:4001/api/v1/token/exchange
NAIS_TOKEN_INTROSPECTION_ENDPOINT=http://localhost:4001/api/v1/introspect

# Lokalt
#ENV=local
#TILBAKE_SCOPE=api://dev-gcp.tilbake.tilbakekreving-backend-lokal/.default

# Lokalt mot dev-backend
ENV=lokalt-mot-preprod
TILBAKE_SCOPE=api://dev-gcp.tilbake.tilbakekreving-backend/.default

APP_VERSION=0.0.1
EOF
