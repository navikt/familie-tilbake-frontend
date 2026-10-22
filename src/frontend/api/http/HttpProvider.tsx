import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { ApiRessurs, Ressurs } from '@/typer/ressurs';

import { captureException } from '@nais/apm';
import constate from 'constate';
import { useState } from 'react';

import { håndterApiRespons, preferredAxios } from './axios';

export interface FamilieRequestConfig<SkjemaData> extends AxiosRequestConfig {
    data?: SkjemaData;
    defaultFeilmelding?: string;
    påvirkerSystemLaster?: boolean;
}

export type FamilieRequest = <SkjemaData, SkjemaRespons>(
    config: FamilieRequestConfig<SkjemaData>
) => Promise<Ressurs<SkjemaRespons>>;

export type Http = {
    systemetLaster: () => boolean;
    request: FamilieRequest;
};

type Props = {
    fjernRessursSomLasterTimeout?: number;
    setUautorisert?: (httpStatus: number) => void;
};

export const [HttpProvider, useHttp] = constate(
    ({ setUautorisert, fjernRessursSomLasterTimeout = 300 }: Props) => {
        const [ressurserSomLaster, setRessurserSomLaster] = useState<string[]>([]);

        const fjernRessursSomLaster = (ressursId: string): void => {
            setTimeout(() => {
                setRessurserSomLaster((prevState: string[]) => {
                    return prevState.filter((ressurs: string) => ressurs !== ressursId);
                });
            }, fjernRessursSomLasterTimeout);
        };

        const systemetLaster = (): boolean => {
            return ressurserSomLaster.length > 0;
        };

        const request: FamilieRequest = async <SkjemaData, SkjemaRespons>(
            config: FamilieRequestConfig<SkjemaData>
        ): Promise<Ressurs<SkjemaRespons>> => {
            const ressursId = `${config.method}_${config.url}`;
            config.påvirkerSystemLaster &&
                setRessurserSomLaster([...ressurserSomLaster, ressursId]);

            return preferredAxios
                .request(config)
                .then((response: AxiosResponse<ApiRessurs<SkjemaRespons>>) => {
                    const responsRessurs: ApiRessurs<SkjemaRespons> = response.data;

                    config.påvirkerSystemLaster && fjernRessursSomLaster(ressursId);
                    return håndterApiRespons({
                        defaultFeilmelding: config.defaultFeilmelding,
                        ressurs: responsRessurs,
                        httpStatus: response.status,
                    });
                })
                .catch((error: AxiosError<ApiRessurs<SkjemaRespons>>) => {
                    if (error.response?.status === 401 && setUautorisert) {
                        setUautorisert(401);
                    }

                    if (
                        error.code !== 'ERR_CANCELED' &&
                        (!error.response || error.response.status >= 500)
                    ) {
                        captureException(error, {
                            context: {
                                httpMethod: config.method ?? 'unknown',
                                httpStatus: String(error.response?.status ?? 'no HTTP response'),
                                errorCode: error.code ?? 'unknown',
                            },
                        });
                    }

                    config.påvirkerSystemLaster && fjernRessursSomLaster(ressursId);

                    const responsRessurs: ApiRessurs<SkjemaRespons> | undefined =
                        error.response?.data;
                    return håndterApiRespons({
                        defaultFeilmelding: config.defaultFeilmelding,
                        error,
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
