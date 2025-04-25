import type { ApiRessurs, Ressurs } from '../../typer/ressurs';
import type { ISaksbehandler } from '../../typer/saksbehandler';
import type { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

import { useQuery } from '@tanstack/react-query';
import constate from 'constate';
import React, { useEffect } from 'react';

import { preferredAxios, håndterApiRespons } from './axios';

export type FamilieRequestConfig<SkjemaData> = AxiosRequestConfig & {
    data?: SkjemaData;
    defaultFeilmelding?: string;
    loggFeilTilSentry?: boolean;
    påvirkerSystemLaster?: boolean;
};

export type FamilieRequest = <SkjemaData, SkjemaRespons>(
    config: FamilieRequestConfig<SkjemaData>
) => Promise<Ressurs<SkjemaRespons>>;

interface IProps {
    fjernRessursSomLasterTimeout?: number;
    innloggetSaksbehandler?: ISaksbehandler;
    settAutentisert?: (autentisert: boolean) => void;
}

const hentCsrfTokenOgSettILocalStorage = async (): Promise<string | null> => {
    try {
        const response = await preferredAxios.get<{ csrfToken: string }>('/api/csrf-token');
        const { csrfToken } = response.data;

        if (csrfToken) {
            localStorage.setItem('csrfToken', csrfToken);
            return csrfToken;
        }
        return null;
    } catch (error) {
        console.error('Greide ikke å hente CSRF-token', error);
        return null;
    }
};

export const [HttpProvider, useHttp] = constate(
    ({ innloggetSaksbehandler, settAutentisert, fjernRessursSomLasterTimeout = 300 }: IProps) => {
        const [ressurserSomLaster, settRessurserSomLaster] = React.useState<string[]>([]);
        const { data: csrfToken, refetch: refetchCsrfToken } = useQuery({
            queryKey: ['csrfToken'],
            queryFn: hentCsrfTokenOgSettILocalStorage,
            staleTime: 1000 * 60 * 30,
            gcTime: Infinity,
            retry: 3,
        });

        useEffect(() => {
            if (csrfToken) {
                localStorage.setItem('csrfToken', csrfToken);
            }
        }, [csrfToken]);

        const fjernRessursSomLaster = (ressursId: string) => {
            setTimeout(() => {
                settRessurserSomLaster((prevState: string[]) => {
                    return prevState.filter((ressurs: string) => ressurs !== ressursId);
                });
            }, fjernRessursSomLasterTimeout);
        };

        const systemetLaster = () => {
            return ressurserSomLaster.length > 0;
        };

        const getCsrfToken = (): string | null => {
            return localStorage.getItem('csrfToken');
        };

        const request: FamilieRequest = async <SkjemaData, SkjemaRespons>(
            config: FamilieRequestConfig<SkjemaData>
        ): Promise<Ressurs<SkjemaRespons>> => {
            const ressursId = `${config.method}_${config.url}`;
            config.påvirkerSystemLaster &&
                settRessurserSomLaster([...ressurserSomLaster, ressursId]);

            // Setter csrf-token i header for request som ikke er GET, HEAD eller OPTIONS
            const ikkeSikreMetoder = ['GET', 'HEAD', 'OPTIONS'];
            if (config.method && !ikkeSikreMetoder.includes(config.method)) {
                let headerCsrfToken = getCsrfToken();

                if (!headerCsrfToken) {
                    await refetchCsrfToken();
                    headerCsrfToken = getCsrfToken();
                }

                if (headerCsrfToken) {
                    config.headers = {
                        ...config.headers,
                        'x-csrf-token': headerCsrfToken,
                    };
                }
            }

            return preferredAxios
                .request(config)
                .then((response: AxiosResponse<ApiRessurs<SkjemaRespons>>) => {
                    const responsRessurs: ApiRessurs<SkjemaRespons> = response.data;

                    config.påvirkerSystemLaster && fjernRessursSomLaster(ressursId);
                    return håndterApiRespons({
                        defaultFeilmelding: config.defaultFeilmelding,
                        innloggetSaksbehandler,
                        loggFeilTilSentry: config.loggFeilTilSentry,
                        ressurs: responsRessurs,
                    });
                })
                .catch((error: AxiosError<ApiRessurs<SkjemaRespons>>) => {
                    if (
                        error.response?.status === 403 &&
                        error.response?.data?.melding?.includes('CSRF')
                    ) {
                        refetchCsrfToken();
                        return request(config);
                    }

                    if (error.message.includes('401') && settAutentisert) {
                        settAutentisert(false);
                    }

                    config.påvirkerSystemLaster && fjernRessursSomLaster(ressursId);

                    const responsRessurs: ApiRessurs<SkjemaRespons> | undefined =
                        error.response?.data;
                    return håndterApiRespons({
                        defaultFeilmelding: config.defaultFeilmelding,
                        error,
                        innloggetSaksbehandler,
                        loggFeilTilSentry: true,
                        ressurs: responsRessurs,
                    });
                });
        };

        return {
            systemetLaster,
            request,
            refetchCsrfToken,
        };
    }
);
