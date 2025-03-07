import type { TexasConfig } from '../typer';

import axios from 'axios';

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
        try {
            const response = await axios.post<SuccessResponse>(this.config.tokenExchangeEndpoint, {
                method: 'POST',
                body: {
                    target: targetScope,
                    user_token: token,
                    identity_provider: 'azuread',
                },
                headers: { 'content-type': 'application/x-www-form-urlencoded' },
            });

            return response.data;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            // TODO: Do something useful 🙂
            console.log(error);
            return {
                access_token: 'invalid',
                expires_in: 3600,
            } as SuccessResponse;
        }
    };
}
