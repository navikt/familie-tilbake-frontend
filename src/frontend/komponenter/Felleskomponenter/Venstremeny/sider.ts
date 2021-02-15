import { IBehandling } from '../../../typer/behandling';

export interface ISide {
    href: string;
    navn: string;
}

export enum SideId {
    FAKTA = 'FAKTA',
    FORELDELSE = 'FORELDELSE',
    VILKÅRSVURDERING = 'VILKÅRSVURDERING',
    VERGE = 'VERGE',
    VEDTAK = 'VEDTAK',
}

export const sider: Record<SideId, ISide> = {
    VERGE: {
        href: 'verge',
        navn: 'Verge',
    },
    FAKTA: {
        href: 'fakta',
        navn: 'Fakta',
    },
    FORELDELSE: {
        href: 'foreldelse',
        navn: 'Foreldelse',
    },
    VILKÅRSVURDERING: {
        href: 'vilkaarsvurdering',
        navn: 'Vilkårsvurdering',
    },
    VEDTAK: {
        href: 'vedtak',
        navn: 'Vedtak',
    },
};

export const erSidenAktiv = (side: ISide, behandling: IBehandling): boolean => {
    if (side === sider.VERGE) {
        return behandling.harVerge;
    }
    return true;
};

export const visSide = (_side: ISide, _åpenBehandling: IBehandling) => {
    return true;
};
