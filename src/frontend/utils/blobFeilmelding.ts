import type { AxiosError } from 'axios';
import type { Error as ApiError } from '@/generated-new';

export const lesFeilmeldingFraBlob = async (
    error: AxiosError<unknown>
): Promise<ApiError | undefined> => {
    const data = error.response?.data;
    if (!(data instanceof Blob)) {
        return undefined;
    }
    try {
        return JSON.parse(await data.text());
    } catch {
        return undefined;
    }
};
