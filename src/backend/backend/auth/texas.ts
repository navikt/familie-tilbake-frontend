import type { TexasConfig } from '../typer';

import axios from 'axios';

import { stdoutLogger } from '../../logging/logging';

type SuccessResponse = {
    access_token: string;
    expires_in: number;
};

// type ErrorResponse = {
//     error: string;
//     status: string;
// };

export class TexasClient {
    private config: TexasConfig;
    constructor(config: TexasConfig) {
        this.config = config;
    }

    exchangeToken = async (token: string, targetScope: string) => {
        const response = await axios.post<SuccessResponse>(
            this.config.tokenExchangeEndpoint,
            {
                target: targetScope,
                user_token: token,
                identity_provider: 'azuread',
            },
            {
                headers: { 'Content-type': 'application/x-www-form-urlencoded' },
            }
        );
        return response.data;
    };

    validateLogin = async (token: string): Promise<boolean> => {
        try {
            const response = await axios.post<IntrospectResponse>(
                this.config.tokenIntrospectionEndpoint,
                {
                    identity_provider: 'azuread',
                    token: token,
                },
                {
                    headers: { 'Content-type': 'application/json' },
                }
            );
            stdoutLogger.info(`validateLogin. response.data=${JSON.stringify(response.data)}`);
            return response.data.active;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    stdoutLogger.error(
                        `Feil validering av innlogging. Statuskode ${error.response.status}, body ${error.response.data}`,
                        error
                    );
                    return false;
                }
            } else {
                stdoutLogger.error('Feil ved validering av innlogging', error);
            }
            throw error;
        }
    };
}

type IntrospectResponse = {
    active: boolean;
    error: string | null;
    [claims: string]: unknown;
};
