import type { TexasClient } from './auth/texas';

import express from 'express';

import { ensureAuthenticated } from './auth/authenticate';
import { hentBrukerprofil, setBrukerprofilPåSesjonRute } from './auth/bruker';

const router = express.Router();

export default (texasClient: TexasClient) => {
    // Bruker
    router.get(
        '/user/profile',
        ensureAuthenticated(texasClient, true),
        setBrukerprofilPåSesjonRute(texasClient),
        hentBrukerprofil()
    );

    return router;
};
