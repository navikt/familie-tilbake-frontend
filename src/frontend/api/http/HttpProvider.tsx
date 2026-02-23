import type { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import type { ApiRessurs, Ressurs } from '~/typer/ressurs';
import type { Saksbehandler } from '~/typer/saksbehandler';

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

export type Http = {
    systemetLaster: () => boolean;
    request: FamilieRequest;
};

type Props = {
    fjernRessursSomLasterTimeout?: number;
    innloggetSaksbehandler?: Saksbehandler;
    settAutentisert?: (autentisert: boolean) => void;
};

export const [HttpProvider, useHttp] = constate(
    ({ innloggetSaksbehandler, settAutentisert, fjernRessursSomLasterTimeout = 300 }: Props) => {
        const [ressurserSomLaster, settRessurserSomLaster] = React.useState<string[]>([]);

        const fjernRessursSomLaster = (ressursId: string): void => {
            setTimeout(() => {
                settRessurserSomLaster((prevState: string[]) => {
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
                settRessurserSomLaster([...ressurserSomLaster, ressursId]);

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
