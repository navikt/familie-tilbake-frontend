kubectl config use-context dev-gcp

function get_secrets() {
  local repo=$1
  kubectl -n teamfamilie get secret ${repo} -o json | jq '.data | map_values(@base64d)'
}

TILBAKE_FRONTEND_LOKAL_SECRETS=$(get_secrets azuread-familie-tilbake-frontend-lokal)

TILBAKE_FRONTEND_CLIENT_ID=$(echo "$TILBAKE_FRONTEND_LOKAL_SECRETS" | jq -r '.AZURE_APP_CLIENT_ID')
TILBAKE_FRONTEND_CLIENT_SECRET=$(echo "$TILBAKE_FRONTEND_LOKAL_SECRETS" | jq -r '.AZURE_APP_CLIENT_SECRET')

# Generate random 32 character strings for the cookie and session keys
COOKIE_KEY1=$(openssl rand -hex 16)
COOKIE_KEY2=$(openssl rand -hex 16)
SESSION_SECRET=$(openssl rand -hex 16)

if [ -z "$TILBAKE_FRONTEND_CLIENT_ID" ]
then
      echo "Klarte ikke å hente miljøvariabler. Er du pålogget Naisdevice og google?"
      return 1
fi

# Write the variables into the .env file
cat << EOF > .env
# Denne filen er generert automatisk ved å kjøre \`hent-og-lagre-miljøvariabler.sh\`

COOKIE_KEY1='$COOKIE_KEY1'
COOKIE_KEY2='$COOKIE_KEY2'
SESSION_SECRET='$SESSION_SECRET'

CLIENT_ID='$TILBAKE_FRONTEND_CLIENT_ID'
CLIENT_SECRET='$TILBAKE_FRONTEND_CLIENT_SECRET'
FAMILIE_TILBAKE_CLIENT_ID=$TILBAKE_CLIENT_ID

# Lokalt
ENV=local
TILBAKE_SCOPE=api://dev-gcp.tilbake.tilbakekreving-backend-lokal/.default

# Lokalt mot preprod
#ENV=lokalt-mot-preprod
#TILBAKE_SCOPE=api://dev-gcp.tilbake.tilbakekreving-backend/.default

APP_VERSION=0.0.1
EOF