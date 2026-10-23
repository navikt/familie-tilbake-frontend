import { init } from '@nais/apm';

const hostname: string = window.location.hostname;
const environment: 'prod-gcp' | 'dev-gcp' | 'local' = hostname.includes('intern.nav.no')
    ? 'prod-gcp'
    : hostname.includes('dev.nav.no')
      ? 'dev-gcp'
      : 'local';

init({
    app: 'tilbakekreving-frontend',
    namespace: 'tilbake',
    environment,
    version: process.env.GITHUB_SHA,
});
