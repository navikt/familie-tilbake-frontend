import path from 'path';

import { Request, Response, Router } from 'express';

import { byggFeiletRessurs, byggSuksessRessurs, RessursStatus } from '@navikt/familie-typer';

import { fagsak_ba2, ba_behandling_4, ba_behandling_5 } from './mock/ba2/BA_fagsak_2';
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
    ba_behandling_20,
    fagsak_ba5,
} from './mock/ba5/BA_fagsak_5';
import {
    beregningsresultat_1,
    beregningsresultat_3,
} from './mock/behandlingsresultat/behandlingsresultat';
import { fagsak_ef2, ef_behandling_4, ef_behandling_5 } from './mock/ef2/EF_fagsak_2';
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
import { fagsak_ks2, ks_behandling_4 } from './mock/ks2/KS_fagsak_2';
import { totrinn_1 } from './mock/totrinn/totrinn';
import { vedtaksbrevtekster_1 } from './mock/vedtak/brevsavsnitt';
import {
    feilutbetalingVilkårsvurdering_ubehandlet_1,
    feilutbetalingVilkårsvurdering_ubehandlet_2,
    feilutbetalingVilkårsvurdering_ubehandlet_3,
    feilutbetalingVilkårsvurdering_ubehandlet_4,
} from './mock/vilkårsvurdering/feilutbetalingVilkårsvurdering_ubehandlet';
import {
    Aktsomhet,
    Foreldelsevurdering,
    HendelseType,
    HendelseUndertype,
    SærligeGrunner,
    Vilkårsresultat,
} from '../frontend/kodeverk';
import {
    FaktaPeriode,
    ForeldelsePeriode,
    IFeilutbetalingFakta,
    IFeilutbetalingForeldelse,
    IFeilutbetalingVilkårsvurdering,
    Periode,
    VilkårsresultatInfo,
    VilkårsvurderingPeriode,
} from '../frontend/typer/feilutbetalingtyper';

const behandleFaktaPerioder = (
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
    const behandletPerioder = behandleFaktaPerioder(
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

const behandleForeldelsePerioder = (
    perioder: ForeldelsePeriode[],
    antallForeldet = 0,
    foreldelsesfrist?: string,
    antallTilleggsfrist = 0,
    oppdagelsesdato?: string,
    antallIkkeForeldet?: number
): ForeldelsePeriode[] => {
    const antIkkFor = antallIkkeForeldet || perioder.length - antallForeldet - antallTilleggsfrist;
    return perioder.map((per, index) => {
        if (index < antallForeldet) {
            return {
                ...per,
                foreldelsesvurderingstype: Foreldelsevurdering.FORELDET,
                begrunnelse: 'Perioden er foreldet',
                foreldelsesfrist: foreldelsesfrist,
            };
        } else if (index < antallForeldet + antallTilleggsfrist) {
            return {
                ...per,
                foreldelsesvurderingstype: Foreldelsevurdering.TILLEGGSFRIST,
                begrunnelse: 'Perioden er ikke foreldet, tilleggsfrist benyttes',
                foreldelsesfrist: foreldelsesfrist,
                oppdagelsesdato: oppdagelsesdato,
            };
        } else if (index < antallForeldet + antallTilleggsfrist + antIkkFor) {
            return {
                ...per,
                foreldelsesvurderingstype: Foreldelsevurdering.IKKE_FORELDET,
                begrunnelse: 'Perdioden er ikke foreldet',
            };
        } else {
            return per;
        }
    });
};

const behandleForeldelse = (
    ubehandletForeldelse: IFeilutbetalingForeldelse,
    antallForeldet = 0,
    antallTilleggsfrist = 0,
    foreldelsesfrist?: string,
    oppdagelsesdato?: string,
    antallIkkeForeldet?: number
): IFeilutbetalingForeldelse => {
    const behandletPerioder = behandleForeldelsePerioder(
        ubehandletForeldelse.foreldetPerioder,
        antallForeldet,
        foreldelsesfrist,
        antallTilleggsfrist,
        oppdagelsesdato,
        antallIkkeForeldet
    );
    return {
        ...ubehandletForeldelse,
        foreldetPerioder: behandletPerioder,
    };
};

const behandleVilkårsvurderingPerioder = (
    perioder: VilkårsvurderingPeriode[],
    vilkårsresultat: VilkårsresultatInfo,
    begrunnelse: string,
    antallForeldet: number,
    antallVurdert?: number
): VilkårsvurderingPeriode[] => {
    const antVurdert = antallVurdert || perioder.length - antallForeldet;
    return perioder.map((per, index) => {
        if (index < antallForeldet) {
            return {
                ...per,
                foreldet: true,
                begrunnelse: 'Perioden er foreldet',
            };
        } else if (index < antallForeldet + antVurdert) {
            return {
                ...per,
                begrunnelse: begrunnelse,
                vilkårsvurderingsresultatInfo: vilkårsresultat,
            };
        } else {
            return per;
        }
    });
};

const behandleVilkårsvurdering = (
    ubehandletVilkårsvurdering: IFeilutbetalingVilkårsvurdering,
    vilkårsresultat: VilkårsresultatInfo,
    begrunnelse: string,
    antallForeldet: number,
    antallVurdert?: number
): IFeilutbetalingVilkårsvurdering => {
    const behandletPerioder = behandleVilkårsvurderingPerioder(
        ubehandletVilkårsvurdering.perioder,
        vilkårsresultat,
        begrunnelse,
        antallForeldet,
        antallVurdert
    );
    return {
        ...ubehandletVilkårsvurdering,
        perioder: behandletPerioder,
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

    router.get(
        '/familie-tilbake/api/fagsystem/:fagsystem/fagsak/:eksternFagsakId/v1',
        (req: Request, res: Response) => {
            const { fagsystem, eksternFagsakId } = req.params;
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
        }
    );

    router.get(
        '/familie-tilbake/api/behandling/v1/:behandlingId',
        (req: Request, res: Response) => {
            const { behandlingId } = req.params;
            switch (behandlingId) {
                case 'ba4':
                    res.send(byggSuksessRessurs(ba_behandling_4));
                    return;
                case 'ba5':
                    res.send(byggSuksessRessurs(ba_behandling_5));
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
                case 'ba20':
                    res.send(byggSuksessRessurs(ba_behandling_20));
                    return;
                case 'ef4':
                    res.send(byggSuksessRessurs(ef_behandling_4));
                    return;
                case 'ef5':
                    res.send(byggSuksessRessurs(ef_behandling_5));
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
                                HendelseType.ANNET,
                                HendelseUndertype.ANNET_FRITEKST,
                                'Dette er ein mock-begrunnelse!'
                            )
                        )
                    );
                    return;
                case 'ba5':
                case 'ba18':
                    res.send(
                        byggSuksessRessurs(
                            behandleFakta(
                                feilutbetalingFakta_ubehandlet_3,
                                HendelseType.ANNET,
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
                                HendelseType.ANNET,
                                HendelseUndertype.ANNET_FRITEKST,
                                'Dette er ein mock-begrunnelse!'
                            )
                        )
                    );
                    return;
                case 'ba19':
                case 'ba20':
                    res.send(
                        byggSuksessRessurs(
                            behandleFakta(
                                feilutbetalingFakta_ubehandlet_4,
                                HendelseType.ANNET,
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
                                HendelseType.ANNET,
                                HendelseUndertype.ANNET_FRITEKST,
                                'Dette er ein mock-begrunnelse!'
                            )
                        )
                    );
                    return;
                case 'ef5':
                    res.send(
                        byggSuksessRessurs(
                            behandleFakta(
                                feilutbetalingFakta_ubehandlet_2,
                                HendelseType.ANNET,
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
                                HendelseType.ANNET,
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
                case 'ba5':
                    res.send(
                        byggSuksessRessurs(
                            behandleForeldelse(feilutbetalingForeldelse_ubehandlet_3, 0, 0)
                        )
                    );
                    return;
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
                                1,
                                '2019-06-01',
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
                                2,
                                '2017-01-10',
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
                case 'ba20':
                    res.send(
                        byggSuksessRessurs(
                            behandleForeldelse(feilutbetalingForeldelse_ubehandlet_4)
                        )
                    );
                    return;
                case 'ef5':
                    res.send(
                        byggSuksessRessurs(
                            behandleForeldelse(feilutbetalingForeldelse_ubehandlet_2)
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
        '/familie-tilbake/api/behandling/:behandlingId/vilkarsvurdering/v1',
        (req: Request, res: Response) => {
            const { behandlingId } = req.params;
            switch (behandlingId) {
                case 'ba4':
                case 'ba12':
                case 'ba13':
                case 'ba14':
                    res.send(
                        byggSuksessRessurs(
                            behandleVilkårsvurdering(
                                feilutbetalingVilkårsvurdering_ubehandlet_1(HendelseType.ANNET),
                                {
                                    vilkårsvurderingsresultat:
                                        Vilkårsresultat.FORSTO_BURDE_FORSTÅTT,
                                    aktsomhet: {
                                        begrunnelse: 'Dette er ein mock-begrunnelse',
                                        aktsomhet: Aktsomhet.GROV_UAKTSOMHET,
                                        særligeGrunnerBegrunnelse: 'Dette er ein mock-begrunnelse',
                                        særligeGrunnerTilReduksjon: true,
                                        andelTilbakekreves: 33,
                                        særligeGrunner: [
                                            {
                                                særligGrunn: SærligeGrunner.GRAD_AV_UAKTSOMHET,
                                            },
                                            {
                                                særligGrunn:
                                                    SærligeGrunner.HELT_ELLER_DELVIS_NAVS_FEIL,
                                            },
                                            {
                                                særligGrunn: SærligeGrunner.ANNET,
                                                begrunnelse: 'Dette er ein mock-begrunnelse',
                                            },
                                        ],
                                    },
                                },
                                'Dette er ein mock-begrunnelse',
                                1
                            )
                        )
                    );
                    return;
                case 'ba5':
                    res.send(
                        byggSuksessRessurs(
                            behandleVilkårsvurdering(
                                feilutbetalingVilkårsvurdering_ubehandlet_3(HendelseType.ANNET),
                                {
                                    vilkårsvurderingsresultat:
                                        Vilkårsresultat.FORSTO_BURDE_FORSTÅTT,
                                    aktsomhet: {
                                        begrunnelse: 'Dette er ein mock-begrunnelse',
                                        aktsomhet: Aktsomhet.GROV_UAKTSOMHET,
                                        særligeGrunnerBegrunnelse: 'Dette er ein mock-begrunnelse',
                                        særligeGrunnerTilReduksjon: true,
                                        andelTilbakekreves: 33,
                                        særligeGrunner: [
                                            {
                                                særligGrunn: SærligeGrunner.GRAD_AV_UAKTSOMHET,
                                            },
                                            {
                                                særligGrunn:
                                                    SærligeGrunner.HELT_ELLER_DELVIS_NAVS_FEIL,
                                            },
                                            {
                                                særligGrunn: SærligeGrunner.ANNET,
                                                begrunnelse: 'Dette er ein mock-begrunnelse',
                                            },
                                        ],
                                    },
                                },
                                'Dette er ein mock-begrunnelse',
                                1,
                                12
                            )
                        )
                    );
                    return;
                case 'ba17':
                    res.send(
                        byggSuksessRessurs(
                            behandleVilkårsvurdering(
                                feilutbetalingVilkårsvurdering_ubehandlet_2(HendelseType.ANNET),
                                {},
                                ``,
                                2
                            )
                        )
                    );
                    return;
                case 'ba20':
                    res.send(
                        byggSuksessRessurs(
                            feilutbetalingVilkårsvurdering_ubehandlet_4(HendelseType.ANNET)
                        )
                    );
                    return;
                case 'ef4':
                    res.send(
                        byggSuksessRessurs(
                            behandleVilkårsvurdering(
                                feilutbetalingVilkårsvurdering_ubehandlet_1(HendelseType.ANNET),
                                {
                                    vilkårsvurderingsresultat:
                                        Vilkårsresultat.FORSTO_BURDE_FORSTÅTT,
                                    aktsomhet: {
                                        begrunnelse: 'Dette er ein mock-begrunnelse',
                                        aktsomhet: Aktsomhet.GROV_UAKTSOMHET,
                                        særligeGrunnerBegrunnelse: 'Dette er ein mock-begrunnelse',
                                        særligeGrunnerTilReduksjon: true,
                                        andelTilbakekreves: 33,
                                        særligeGrunner: [
                                            {
                                                særligGrunn: SærligeGrunner.GRAD_AV_UAKTSOMHET,
                                            },
                                            {
                                                særligGrunn:
                                                    SærligeGrunner.HELT_ELLER_DELVIS_NAVS_FEIL,
                                            },
                                            {
                                                særligGrunn: SærligeGrunner.ANNET,
                                                begrunnelse: 'Dette er ein mock-begrunnelse',
                                            },
                                        ],
                                    },
                                },
                                'Dette er ein mock-begrunnelse',
                                1
                            )
                        )
                    );
                    return;
                case 'ef5':
                    res.send(
                        byggSuksessRessurs(
                            feilutbetalingVilkårsvurdering_ubehandlet_2(HendelseType.ANNET)
                        )
                    );
                    return;
                case 'ks4':
                    res.send(
                        byggSuksessRessurs(
                            behandleVilkårsvurdering(
                                feilutbetalingVilkårsvurdering_ubehandlet_1(HendelseType.ANNET),
                                {
                                    vilkårsvurderingsresultat:
                                        Vilkårsresultat.FORSTO_BURDE_FORSTÅTT,
                                    aktsomhet: {
                                        begrunnelse: 'Dette er ein mock-begrunnelse',
                                        aktsomhet: Aktsomhet.GROV_UAKTSOMHET,
                                        særligeGrunnerBegrunnelse: 'Dette er ein mock-begrunnelse',
                                        særligeGrunnerTilReduksjon: true,
                                        andelTilbakekreves: 33,
                                        særligeGrunner: [
                                            {
                                                særligGrunn: SærligeGrunner.GRAD_AV_UAKTSOMHET,
                                            },
                                            {
                                                særligGrunn:
                                                    SærligeGrunner.HELT_ELLER_DELVIS_NAVS_FEIL,
                                            },
                                            {
                                                særligGrunn: SærligeGrunner.ANNET,
                                                begrunnelse: 'Dette er ein mock-begrunnelse',
                                            },
                                        ],
                                    },
                                },
                                'Dette er ein mock-begrunnelse',
                                1
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
        '/familie-tilbake/api/dokument/vedtaksbrevtekst/:behandlingId',
        (_req: Request, res: Response) => {
            res.send(byggSuksessRessurs(vedtaksbrevtekster_1));
        }
    );

    router.post(
        '/familie-tilbake/api/dokument/forhandsvis-vedtaksbrev',
        (req: Request, res: Response) => {
            console.log(`Skal hente for vedtaksbrev for forhåndsvisning for behandling`, req.body);
            res.send(byggSuksessRessurs('OK'));
        }
    );

    router.get(
        '/familie-tilbake/api/behandling/:behandlingId/beregn/resultat/v1',
        (req: Request, res: Response) => {
            const { behandlingId } = req.params;
            switch (behandlingId) {
                case 'ba4':
                case 'ba12':
                case 'ba13':
                case 'ba14':
                case 'ef4':
                case 'ks4':
                    res.send(byggSuksessRessurs(beregningsresultat_1));
                    return;
                case 'ba5':
                    res.send(byggSuksessRessurs(beregningsresultat_3));
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
        '/familie-tilbake/api/behandling/:behandlingId/totrinn/v1',
        (_req: Request, res: Response) => {
            res.send(byggSuksessRessurs(totrinn_1));
        }
    );

    router.post(
        '/familie-tilbake/api/behandling/:behandlingId/steg/v1',
        (req: Request, res: Response) => {
            const { behandlingId } = req.params;
            const payload = req.body;
            console.log(`Har fått behandlet data på behandling ${behandlingId}: `, payload);
            res.send(byggSuksessRessurs('OK'));
        }
    );

    router.post('/familie-tilbake/api/dokument/forhandsvis', (req: Request, res: Response) => {
        const payload = req.body;
        console.log(`Skal forhåndsvise brev for behandling: `, payload);
        res.send(byggSuksessRessurs('OK'));
    });

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
