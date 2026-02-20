FROM gcr.io/distroless/nodejs20-debian12:nonroot
WORKDIR /app

COPY node_dist ./node_dist
COPY dist ./dist

# Må kopiere package.json og node_modules for at backend skal fungere. Backend henter avhengigheter runtime fra node_modules, og package.json trengs for at 'import' statements skal fungere.
COPY node_modules ./node_modules
COPY package.json .

EXPOSE 8000
ENV NODE_ENV=production
CMD [ "--import=./node_dist/backend/register.js", "--es-module-specifier-resolution=node", "node_dist/backend/server.js" ]
