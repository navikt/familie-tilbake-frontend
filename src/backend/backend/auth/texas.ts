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
    private targetScope: string;

    constructor(config: TexasConfig, targetScope: string) {
        this.config = config;
        this.targetScope = targetScope;
    }

    exchangeToken = async (token: string) => {
        try {
            const response = await axios.post<SuccessResponse>(this.config.tokenExchangeEndpoint, {
                method: 'POST',
                body: {
                    target: this.targetScope,
                    user_token: token,
                    identity_provider: 'azuread',
                },
                headers: { 'content-type': 'application/x-www-form-urlencoded' },
            });

            return response.data;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            throw Error('Bruker har ikke tilgang til å kalle tjenesten.', error);
        }
    };
}
