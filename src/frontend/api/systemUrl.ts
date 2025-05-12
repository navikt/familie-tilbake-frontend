import { preferredAxios } from './axios';

export type SystemBaseUrl = {
    aInntektBaseUrl: string;
    gosysBaseUrl: string;
    modiaBaseUrl: string;
};

export const hentSystemUrl = async (): Promise<SystemBaseUrl> => {
    const response = await preferredAxios.get<SystemBaseUrl>('/system-url');
    return response.data;
};
