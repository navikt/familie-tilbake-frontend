import path from 'path';

import { Request, Response, Router } from 'express';

import { byggFeiletRessurs, byggSuksessRessurs, RessursStatus } from '@navikt/familie-typer';

import { fagsak_ba2, ba_behandling_4 } from './mock/ba2/BA_fagsak_2';
import {
    fagsak_ba3,
    ba_behandling_6,
    ba_behandling_7,
    ba_behandling_8,
    ba_behandling_9,
} from './mock/ba3/BA_fagsak_3';
import {
    fagsak_ba4,
    ba_behandling_12,
    ba_behandling_13,
    ba_behandling_14,
} from './mock/ba4/BA_fagsak_4';
import {
    ba_behandling_16,
    ba_behandling_17,
    ba_behandling_18,
    ba_behandling_19,
    fagsak_ba5,
} from './mock/ba5/BA_fagsak_5';
import { fagsak_ef2, ef_behandling_4 } from './mock/ef2/EF_fagsak_2';
import { fagsak_ks2, ks_behandling_4 } from './mock/ks2/KS_fagsak_2';
import {
    feilutbetalingFakta_ubehandlet_1,
    feilutbetalingFakta_ubehandlet_2,
    feilutbetalingFakta_ubehandlet_3,
    feilutbetalingFakta_ubehandlet_4,
} from './mock/fakta/feilutbetalingFakta_ubehandlet';
import {
    feilutbetalingForeldelse_ubehandlet_1,
    feilutbetalingForeldelse_ubehandlet_2,
    feilutbetalingForeldelse_ubehandlet_3,
    feilutbetalingForeldelse_ubehandlet_4,
} from './mock/foreldelse/feilutbetalingForeldelse_ubehandlet';
import {
    FaktaPeriode,
    ForeldelsePeriode,
    IFeilutbetalingFakta,
    IFeilutbetalingForeldelse,
    Periode,
} from '../frontend/typer/feilutbetalingtyper';
import { Foreldelsevurdering, HendelseType, HendelseUndertype } from '../frontend/kodeverk';

const behandleFaktaPeriode = (
    perioder: FaktaPeriode[],
    hendelsestype: HendelseType,
    hendelsesundertype: HendelseUndertype
): FaktaPeriode[] => {
    return perioder.map(per => ({
        ...per,
        hendelsestype: hendelsestype,
        hendelsesundertype: hendelsesundertype,
    }));
};

const behandleFakta = (
    ubehandletFakta: IFeilutbetalingFakta,
    hendelsestype: HendelseType,
    hendelsesundertype: HendelseUndertype,
    begrunnelse: string
): IFeilutbetalingFakta => {
    const behandletPerioder = behandleFaktaPeriode(
        ubehandletFakta.feilutbetaltePerioder,
        hendelsestype,
        hendelsesundertype
    );
    return {
        ...ubehandletFakta,
        begrunnelse: begrunnelse,
        feilutbetaltePerioder: behandletPerioder,
    };
};

const behandleForeldelsePeriode = (
    perioder: ForeldelsePeriode[],
    antallForeldet: number = 0,
    foreldelsesfrist?: string,
    foreldelseBegrunnelse?: string,
    antallTilleggsfrist: number = 0,
    oppdagelsesdato?: string,
    tilleggsfristBegrunnelse?: string,
    antallIkkeForeldet?: number,
    ikkeForeldetBegrunnelse?: string
): ForeldelsePeriode[] => {
    const antIkkFor = antallIkkeForeldet || perioder.length - antallForeldet - antallTilleggsfrist;
    return perioder.map((per, index) => {
        if (index < antallForeldet) {
            return {
                ...per,
                foreldelsesvurderingstype: Foreldelsevurdering.FORELDET,
                begrunnelse: foreldelseBegrunnelse,
                foreldelsesfrist: foreldelsesfrist,
            };
        } else if (index < antallForeldet + antallTilleggsfrist) {
            return {
                ...per,
                foreldelsesvurderingstype: Foreldelsevurdering.TILLEGGSFRIST,
                begrunnelse: tilleggsfristBegrunnelse,
                foreldelsesfrist: foreldelsesfrist,
                oppdagelsesdato: oppdagelsesdato,
            };
        } else if (index < antallForeldet + antallTilleggsfrist + antIkkFor) {
            return {
                ...per,
                foreldelsesvurderingstype: Foreldelsevurdering.IKKE_FORELDET,
                begrunnelse: ikkeForeldetBegrunnelse,
            };
        } else {
            return per;
        }
    });
};

const behandleForeldelse = (
    ubehandletForeldelse: IFeilutbetalingForeldelse,
    antallForeldet: number = 0,
    foreldelsesfrist?: string,
    antallTilleggsfrist: number = 0,
    oppdagelsesdato?: string,
    antallIkkeForeldet?: number
): IFeilutbetalingForeldelse => {
    const behandletPerioder = behandleForeldelsePeriode(
        ubehandletForeldelse.foreldetPerioder,
        antallForeldet,
        foreldelsesfrist,
        'Perioden er foreldet',
        antallTilleggsfrist,
        oppdagelsesdato,
        'Perioden er ikke foreldet, tilleggsfrist benyttes',
        antallIkkeForeldet,
        'Perdioden er ikke foreldet'
    );
    return {
        ...ubehandletForeldelse,
        foreldetPerioder: behandletPerioder,
    };
};

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

    router.put(
        '/familie-tilbake/api/behandling/:behandlingId/vent/v1',
        (req: Request, res: Response) => {
            const { behandlingId } = req.params;
            console.log(`Skal sette behandling ${behandlingId} på vent: `, req.body);
            res.send(byggSuksessRessurs('OK'));
        }
    );

    router.put(
        '/familie-tilbake/api/behandling/:behandlingId/gjenoppta/v1',
        (req: Request, res: Response) => {
            const { behandlingId } = req.params;
            console.log(`Skal gjennopta behandlingen av ${behandlingId}`);
            res.send(byggSuksessRessurs('OK'));
        }
    );

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
            case 'ba5':
                res.send(byggSuksessRessurs(fagsak_ba5));
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
                case 'ba16':
                    res.send(byggSuksessRessurs(ba_behandling_16));
                    return;
                case 'ba17':
                    res.send(byggSuksessRessurs(ba_behandling_17));
                    return;
                case 'ba18':
                    res.send(byggSuksessRessurs(ba_behandling_18));
                    return;
                case 'ba19':
                    res.send(byggSuksessRessurs(ba_behandling_19));
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
        '/familie-tilbake/api/behandling/:behandlingId/fakta/v1',
        (req: Request, res: Response) => {
            const { behandlingId } = req.params;
            switch (behandlingId) {
                case 'ba4':
                case 'ba12':
                case 'ba13':
                case 'ba14':
                    res.send(
                        byggSuksessRessurs(
                            behandleFakta(
                                feilutbetalingFakta_ubehandlet_1,
                                HendelseType.BA_ANNET,
                                HendelseUndertype.ANNET_FRITEKST,
                                'Dette er ein mock-begrunnelse!'
                            )
                        )
                    );
                    return;
                case 'ba8':
                    res.send(byggSuksessRessurs(feilutbetalingFakta_ubehandlet_4));
                    return;
                case 'ba9':
                    res.send(byggSuksessRessurs(feilutbetalingFakta_ubehandlet_2));
                    return;
                case 'ba16':
                case 'ba17':
                    res.send(
                        byggSuksessRessurs(
                            behandleFakta(
                                feilutbetalingFakta_ubehandlet_2,
                                HendelseType.BA_ANNET,
                                HendelseUndertype.ANNET_FRITEKST,
                                'Dette er ein mock-begrunnelse!'
                            )
                        )
                    );
                    return;
                case 'ba18':
                    res.send(
                        byggSuksessRessurs(
                            behandleFakta(
                                feilutbetalingFakta_ubehandlet_3,
                                HendelseType.BA_ANNET,
                                HendelseUndertype.ANNET_FRITEKST,
                                'Dette er ein mock-begrunnelse!'
                            )
                        )
                    );
                    return;
                case 'ba19':
                    res.send(
                        byggSuksessRessurs(
                            behandleFakta(
                                feilutbetalingFakta_ubehandlet_4,
                                HendelseType.BA_ANNET,
                                HendelseUndertype.ANNET_FRITEKST,
                                'Dette er ein mock-begrunnelse!'
                            )
                        )
                    );
                    return;
                case 'ef4':
                    res.send(
                        byggSuksessRessurs(
                            behandleFakta(
                                feilutbetalingFakta_ubehandlet_1,
                                HendelseType.EF_ANNET,
                                HendelseUndertype.ANNET_FRITEKST,
                                'Dette er ein mock-begrunnelse!'
                            )
                        )
                    );
                    return;
                case 'ks4':
                    res.send(
                        byggSuksessRessurs(
                            behandleFakta(
                                feilutbetalingFakta_ubehandlet_1,
                                HendelseType.KS_ANNET,
                                HendelseUndertype.ANNET_FRITEKST,
                                'Dette er ein mock-begrunnelse!'
                            )
                        )
                    );
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

    router.get(
        '/familie-tilbake/api/behandling/:behandlingId/foreldelse/v1',
        (req: Request, res: Response) => {
            const { behandlingId } = req.params;
            switch (behandlingId) {
                case 'ba12':
                case 'ba13':
                case 'ba14':
                case 'ef4':
                case 'ks4':
                    res.send(
                        byggSuksessRessurs(
                            behandleForeldelse(
                                feilutbetalingForeldelse_ubehandlet_1,
                                1,
                                '2019-06-01',
                                1,
                                '2020-11-01'
                            )
                        )
                    );
                    return;
                case 'ba16':
                    res.send(byggSuksessRessurs(feilutbetalingForeldelse_ubehandlet_2));
                    return;
                case 'ba17':
                    res.send(
                        byggSuksessRessurs(
                            behandleForeldelse(
                                feilutbetalingForeldelse_ubehandlet_2,
                                2,
                                '2017-01-10',
                                2,
                                '2020-11-10'
                            )
                        )
                    );
                    return;
                case 'ba18':
                    res.send(byggSuksessRessurs(feilutbetalingForeldelse_ubehandlet_3));
                    return;
                case 'ba19':
                    res.send(byggSuksessRessurs(feilutbetalingForeldelse_ubehandlet_4));
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

    router.post(
        '/familie-tilbake/api/behandling/:behandlingId/steg/v1',
        (req: Request, res: Response) => {
            const { behandlingId } = req.params;
            console.log(`Har fått behandlet data på behandling ${behandlingId}: `, req.body);
            res.send(byggSuksessRessurs('OK'));
        }
    );

    router.post(
        '/familie-tilbake/api/behandling/:behandlingId/beregn/v1',
        (req: Request, res: Response) => {
            const { behandlingId } = req.params;
            console.log(
                `Har fått nye perioder for å beregne på behandling ${behandlingId}: `,
                req.body
            );
            const perioder: Periode[] = req.body;
            res.send(
                byggSuksessRessurs({
                    beregnetPerioder: [
                        {
                            periode: perioder[0],
                            feilutbetaltBeløp: 3000,
                        },
                        {
                            periode: perioder[1],
                            feilutbetaltBeløp: 2000,
                        },
                    ],
                })
            );
        }
    );

    router.get('*', (_: Request, res: Response) => {
        res.sendFile('index.html', { root: path.join(process.cwd(), 'frontend_development/') });
    });

    return router;
};
