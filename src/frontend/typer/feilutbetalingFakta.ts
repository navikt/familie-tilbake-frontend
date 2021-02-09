import { HendelseType, HendelseUndertype } from '../kodeverk/feilutbetalingsÅrsak';

export interface IFaktaPeriode {
    fom: string;
    tom: string;
    belop: number;
    feilutbetalingÅrsakDto?: {
        hendelseType: HendelseType;
        hendelseUndertype?: HendelseUndertype;
    };
}

export interface IFeilutbetalingFakta {
    behandlingFakta?: {
        perioder?: Array<IFaktaPeriode>;
        totalPeriodeFom: string;
        totalPeriodeTom: string;
        aktuellFeilUtbetaltBeløp: number;
        tidligereVarsletBeløp?: number;
        behandlingÅrsaker?: Array<string>;
        behandlingsresultat?: {
            resultat: string;
            konsekvenserForYtelsen: Array<string>;
        };
        tilbakekrevingValg?: {
            videreBehandling: string;
        };
        datoForRevurderingsvedtak: string;
        begrunnelse?: string;
    };
}
