import type { Feil } from '../../../api/feil';
import type { AxiosError } from 'axios';

import { isAxiosError } from 'axios';

export const hentStatus = (error: AxiosError | Feil): number | undefined => {
    if (isAxiosError(error)) {
        return error.response?.status;
    }
    return error.status;
};
