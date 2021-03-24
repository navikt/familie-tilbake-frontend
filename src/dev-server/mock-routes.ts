import path from 'path';

import { Request, Response, Router } from 'express';

import { byggFeiletRessurs, byggSuksessRessurs, RessursStatus } from '@navikt/familie-typer';

import { fagsak_ba2, ba_behandling_4, ba_feilutbetalingFakta_4 } from './mock/ba2/BA_fagsak_2';
import {
    fagsak_ba3,
    ba_behandling_6,
    ba_behandling_7,
    ba_behandling_8,
    ba_feilutbetalingFakta_8,
    ba_behandling_9,
    ba_feilutbetalingFakta_9,
} from './mock/ba3/BA_fagsak_3';
import {
    fagsak_ba4,
    ba_behandling_12,
    ba_behandling_13,
    ba_behandling_14,
} from './mock/ba4/BA_fagsak_4';
import { fagsak_ef2, ef_behandling_4, ef_feilutbetalingFakta_4 } from './mock/EF_fagsak_2';
import { fagsak_ks2, ks_behandling_4, ks_feilutbetalingFakta_4 } from './mock/KS_fagsak_2';

export const setupRouter = (router: Router) => {
    router.get('/user/profile', (_: Request, res: Response) => {
        res.send({
            displayName: 'Test Testersen',
            enhet: '8888',
            navIdent: 'Z991144',
            groups: ['9449c153-5a1e-44a7-84c6-7cc7a8867233'],
            email: 'VL',
        });
    });

    router.put('/familie-tilbake/api/behandling/vent/v1', (req: Request, res: Response) => {
        console.log('Skal sette behandling på vent: ', req.body);
        res.send(byggSuksessRessurs('OK'));
    });

    router.get('/familie-tilbake/api/fagsak/v1', (req: Request, res: Response) => {
        const { fagsystem, fagsak: eksternFagsakId } = req.query;
        switch (eksternFagsakId) {
            case 'ba2':
                res.send(byggSuksessRessurs(fagsak_ba2));
                return;
            case 'ba3':
                res.send(byggSuksessRessurs(fagsak_ba3));
                return;
            case 'ba4':
                res.send(byggSuksessRessurs(fagsak_ba4));
                return;
            case 'ef2':
                res.send(byggSuksessRessurs(fagsak_ef2));
                return;
            case 'ks2':
                res.send(byggSuksessRessurs(fagsak_ks2));
                return;
            case 'ba_it':
            case 'ef_it':
            case 'ks_it':
                res.send({
                    status: RessursStatus.IKKE_TILGANG,
                });
                return;
            default:
                res.send(
                    byggFeiletRessurs(
                        'Ingen fagsak fra fagsystemet ' +
                            fagsystem +
                            ' og med id ' +
                            eksternFagsakId
                    )
                );
        }
    });

    router.get(
        '/familie-tilbake/api/behandling/v1/:behandlingId',
        (req: Request, res: Response) => {
            const { behandlingId } = req.params;
            switch (behandlingId) {
                case 'ba4':
                    res.send(byggSuksessRessurs(ba_behandling_4));
                    return;
                case 'ba6':
                    res.send(byggSuksessRessurs(ba_behandling_6));
                    return;
                case 'ba7':
                    res.send(byggSuksessRessurs(ba_behandling_7));
                    return;
                case 'ba8':
                    res.send(byggSuksessRessurs(ba_behandling_8));
                    return;
                case 'ba9':
                    res.send(byggSuksessRessurs(ba_behandling_9));
                    return;
                case 'ba12':
                    res.send(byggSuksessRessurs(ba_behandling_12));
                    return;
                case 'ba13':
                    res.send(byggSuksessRessurs(ba_behandling_13));
                    return;
                case 'ba14':
                    res.send(byggSuksessRessurs(ba_behandling_14));
                    return;
                case 'ef4':
                    res.send(byggSuksessRessurs(ef_behandling_4));
                    return;
                case 'ks4':
                    res.send(byggSuksessRessurs(ks_behandling_4));
                    return;
                case 'ba_it':
                case 'ef_it':
                case 'ks_it':
                    res.send({
                        status: RessursStatus.IKKE_TILGANG,
                    });
                    return;
                default:
                    res.send(byggFeiletRessurs('Ingen behandling med id ' + behandlingId));
            }
        }
    );

    router.get(
        '/familie-tilbake/api/behandling/v1/:behandlingId/fakta',
        (req: Request, res: Response) => {
            const { behandlingId } = req.params;
            switch (behandlingId) {
                case 'ba4':
                    res.send(byggSuksessRessurs(ba_feilutbetalingFakta_4));
                    return;
                case 'ba8':
                    res.send(byggSuksessRessurs(ba_feilutbetalingFakta_8));
                    return;
                case 'ba9':
                    res.send(byggSuksessRessurs(ba_feilutbetalingFakta_9));
                    return;
                case 'ef4':
                    res.send(byggSuksessRessurs(ef_feilutbetalingFakta_4));
                    return;
                case 'ks4':
                    res.send(byggSuksessRessurs(ks_feilutbetalingFakta_4));
                    return;
                default:
                    res.send(
                        byggFeiletRessurs(
                            'Ingen feilutbetaling for behandling med id ' + behandlingId
                        )
                    );
            }
        }
    );

    router.get('*', (_: Request, res: Response) => {
        res.sendFile('index.html', { root: path.join(process.cwd(), 'frontend_development/') });
    });

    return router;
};
