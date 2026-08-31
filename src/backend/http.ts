import type { AxiosResponse } from 'axios';
import type { Request } from 'express';

import axios from 'axios';

import { logRequest } from './backend';
import { LogLevel } from './logging/logging';

const erAutentiseringsfeil = (e: unknown): boolean =>
    axios.isAxiosError(e) && (e.response?.status === 401 || e.response?.status === 403);

export const retry = async <T, D>(
    req: Request,
    action: string,
    callback: () => Promise<AxiosResponse<T, D>>
): Promise<AxiosResponse<T, D>> => {
    try {
        return await callback();
    } catch (e) {
        if (erAutentiseringsfeil(e)) {
            logRequest(
                req,
                `Kunne ikke ${action} - autentiseringsfeil, prøver ikke på nytt: ${e}`,
                LogLevel.Warning
            );
            throw e;
        }
        logRequest(req, `Kunne ikke ${action} - prøver på nytt: ${e}`, LogLevel.Warning);
        return await callback();
    }
};
