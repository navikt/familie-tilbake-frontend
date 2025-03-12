import type { IAppConfig } from './typer';

import { envVar } from '../utils';

export const appConfig: IAppConfig = {
    sessionSecret: envVar('SESSION_SECRET'),
    backendApiScope: envVar('TILBAKE_SCOPE'),
};
