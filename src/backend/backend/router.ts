import type { TexasClient } from './auth/texas';
import type { Router } from 'express';

import express from 'express';

import { ensureAuthenticated } from './auth/authenticate';
import { hentBrukerprofil } from './auth/bruker';

const router = express.Router();

export default (texasClient: TexasClient): Router => {
    // Bruker
    router.get(
        '/user/profile',
        ensureAuthenticated(texasClient, true),
        hentBrukerprofil(texasClient)
    );

    return router;
};
