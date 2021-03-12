import path from 'path';

import { Request, Response, Router } from 'express';

import { byggFeiletRessurs, byggSuksessRessurs, RessursStatus } from '@navikt/familie-typer';

import { fagsak_ba2, ba_behandling_4, ba_feilutbetalingFakta_4 } from './mock';
import { fagsak_ef2, ef_behandling_4, ef_feilutbetalingFakta_4 } from './mock';
import { fagsak_ks2 } from './mock/KS_fagsak_2';
import { ks_behandling_4, ks_feilutbetalingFakta_4 } from './mock/KS_behandling_4';

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

    router.get('/familie-tilbake/api/fagsak/v1', (req: Request, res: Response) => {
        const { fagsystem, fagsak: eksternFagsakId } = req.query;
        switch (eksternFagsakId) {
            case 'ba2':
                res.send(byggSuksessRessurs(fagsak_ba2));
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
