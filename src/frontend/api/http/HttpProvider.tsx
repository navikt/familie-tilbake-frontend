import type { ApiRessurs, Ressurs } from '../../typer/ressurs';
import type { ISaksbehandler } from '../../typer/saksbehandler';
import type { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

import constate from 'constate';
import React from 'react';

import { preferredAxios, håndterApiRespons } from './axios';

export interface FamilieRequestConfig<SkjemaData> extends AxiosRequestConfig {
    data?: SkjemaData;
    defaultFeilmelding?: string;
    loggFeilTilSentry?: boolean;
    påvirkerSystemLaster?: boolean;
}

export type FamilieRequest = <SkjemaData, SkjemaRespons>(
    config: FamilieRequestConfig<SkjemaData>
) => Promise<Ressurs<SkjemaRespons>>;

interface IProps {
    fjernRessursSomLasterTimeout?: number;
    innloggetSaksbehandler?: ISaksbehandler;
    settAutentisert?: (autentisert: boolean) => void;
}

const hentCsrfTokenFraMeta = (): string | null =>
    document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || null;

export const [HttpProvider, useHttp] = constate(
    ({ innloggetSaksbehandler, settAutentisert, fjernRessursSomLasterTimeout = 300 }: IProps) => {
        const [ressurserSomLaster, settRessurserSomLaster] = React.useState<string[]>([]);

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

        const request: FamilieRequest = async <SkjemaData, SkjemaRespons>(
            config: FamilieRequestConfig<SkjemaData>
        ): Promise<Ressurs<SkjemaRespons>> => {
            const ressursId = `${config.method}_${config.url}`;
            config.påvirkerSystemLaster &&
                settRessurserSomLaster([...ressurserSomLaster, ressursId]);

            // Setter csrf-token i header for request som ikke er GET, HEAD eller OPTIONS
            const ikkeSikreMetoder = ['GET', 'HEAD', 'OPTIONS'];
            if (config.method && !ikkeSikreMetoder.includes(config.method)) {
                const csrfToken = hentCsrfTokenFraMeta();
                if (csrfToken) {
                    config.headers = {
                        ...config.headers,
                        'x-csrf-token': csrfToken,
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
                        httpStatus: response.status,
                    });
                })
                .catch((error: AxiosError<ApiRessurs<SkjemaRespons>>) => {
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
                        httpStatus: error.response?.status,
                    });
                });
        };

        return {
            systemetLaster,
            request,
        };
    }
);
