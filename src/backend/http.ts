import type { AxiosResponse } from 'axios';
import type { Request } from 'express';

import { logRequest } from './backend';
import { LogLevel } from './logging/logging';

export const retry = async <T, D>(
    req: Request,
    action: string,
    callback: () => Promise<AxiosResponse<T, D>>
) => {
    try {
        return callback();
    } catch (e) {
        logRequest(req, `Kunne ikke ${action} - prøver på nytt: ${e}`, LogLevel.Warning);
        return callback();
    }
};
