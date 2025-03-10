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
        const response = await axios.post<SuccessResponse>(
            this.config.tokenExchangeEndpoint,
            {
                target: targetScope,
                user_token: token,
                identity_provider: 'azuread',
            },
            {
                headers: { 'content-type': 'application/x-www-form-urlencoded' },
            }
        );
        return response.data;
    };
}
