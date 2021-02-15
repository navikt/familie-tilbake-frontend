import { HendelseType, HendelseUndertype, Foreldelsevurdering } from '../kodeverk';

type FeilutbetalingPeriode = {
    fom: string;
    tom: string;
    belop: number;
};

export type FaktaPeriode = {
    feilutbetalingÅrsakDto?: {
        hendelseType: HendelseType;
        hendelseUndertype?: HendelseUndertype;
    };
} & FeilutbetalingPeriode;

export interface IFeilutbetalingFakta {
    behandlingFakta?: {
        perioder?: FaktaPeriode[];
        totalPeriodeFom: string;
        totalPeriodeTom: string;
        aktuellFeilUtbetaltBeløp: number;
        tidligereVarsletBeløp?: number;
        behandlingårsaker?: string[];
        behandlingsresultat?: {
            resultat: string;
            konsekvenserForYtelsen: string[];
        };
        tilbakekrevingValg?: {
            videreBehandling: string;
        };
        datoForRevurderingsvedtak: string;
        begrunnelse?: string;
    };
}

export type ForeldelsePeriode = {
    foreldelseVurderingType: Foreldelsevurdering;
    begrunnelse?: string;
    foreldelsesfrist?: string;
    oppdagelsesDato?: string;
} & FeilutbetalingPeriode;

export interface IFeilutbetalingForeldelse {
    perioder: ForeldelsePeriode[];
}
