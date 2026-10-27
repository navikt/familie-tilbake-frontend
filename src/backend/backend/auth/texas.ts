import type { TexasConfig } from '../typer';

import axios from 'axios';

import { stdoutLogger } from '../../logging/logging';
import { tilFeilUtenToken } from './feilUtenToken';

type SuccessResponse = {
    access_token: string;
    expires_in: number;
};

export class TexasClient {
    private config: TexasConfig;
    constructor(config: TexasConfig) {
        this.config = config;
    }

    exchangeToken = async (token: string, targetScope: string): Promise<SuccessResponse> => {
        try {
            const response = await axios.post<SuccessResponse>(
                this.config.tokenExchangeEndpoint,
                {
                    target: targetScope,
                    user_token: token,
                    identity_provider: 'azuread',
                },
                {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                }
            );
            return response.data;
        } catch (error: unknown) {
            throw tilFeilUtenToken('Feil ved veksling av token', error);
        }
    };

    hentOnBehalfOfToken = async (token: string, targetScope: string): Promise<string> => {
        const exchangeResponse = await this.exchangeToken(token, targetScope);
        return exchangeResponse.access_token;
    };

    validateLogin = async (token: string): Promise<IntrospectResponse | null> => {
        try {
            const response = await axios.post<IntrospectResponse>(
                this.config.tokenIntrospectionEndpoint,
                {
                    identity_provider: 'azuread',
                    token: token,
                },
                {
                    headers: { 'Content-Type': 'application/json' },
                }
            );
            return response.data.active ? response.data : null;
        } catch (error: unknown) {
            const feilUtenToken = tilFeilUtenToken('Feil ved validering av innlogging', error);
            stdoutLogger.error(feilUtenToken.message);
            if (axios.isAxiosError(error) && error.response) {
                return null;
            }
            throw feilUtenToken;
        }
    };
}

export type IntrospectResponse = {
    active: boolean;
    error: string | null;
    sub?: string;
    [claims: string]: unknown;
};
