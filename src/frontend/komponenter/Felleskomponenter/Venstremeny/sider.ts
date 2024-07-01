import {
    Behandlingssteg,
    Behandlingsstegstatus,
    IBehandling,
    IBehandlingsstegstilstand,
} from '../../../typer/behandling';

export interface ISide {
    href: string;
    navn: string;
    steg: Behandlingssteg;
}

export enum SideId {
    FAKTA = 'FAKTA',
    FORELDELSE = 'FORELDELSE',
    VILKÅRSVURDERING = 'VILKÅRSVURDERING',
    VERGE = 'VERGE',
    VEDTAK = 'VEDTAK',
    BREVMOTTAKER = 'BREVMOTTAKER',
}

export const sider: Record<SideId, ISide> = {
    BREVMOTTAKER: {
        href: 'brevmottakere',
        navn: 'Brevmottaker(e)',
        steg: Behandlingssteg.BREVMOTTAKER,
    },
    VERGE: {
        href: 'verge',
        navn: 'Verge',
        steg: Behandlingssteg.VERGE,
    },
    FAKTA: {
        href: 'fakta',
        navn: 'Fakta',
        steg: Behandlingssteg.FAKTA,
    },
    FORELDELSE: {
        href: 'foreldelse',
        navn: 'Foreldelse',
        steg: Behandlingssteg.FORELDELSE,
    },
    VILKÅRSVURDERING: {
        href: 'vilkaarsvurdering',
        navn: 'Vilkårsvurdering',
        steg: Behandlingssteg.VILKÅRSVURDERING,
    },
    VEDTAK: {
        href: 'vedtak',
        navn: 'Vedtak',
        steg: Behandlingssteg.FORESLÅ_VEDTAK,
    },
};

const aktiveBehandlingstegstatuser = [
    Behandlingsstegstatus.UTFØRT,
    Behandlingsstegstatus.AUTOUTFØRT,
    Behandlingsstegstatus.KLAR,
    Behandlingsstegstatus.VENTER,
];

export const erSidenAktiv = (side: ISide, behandling: IBehandling): boolean => {
    if (side === sider.VERGE) {
        return (
            behandling.harVerge ||
            (behandling.behandlingsstegsinfo &&
                sjekkOmSidenErAktiv(side, behandling.behandlingsstegsinfo))
        );
    }

    if (behandling.behandlingsstegsinfo) {
        return sjekkOmSidenErAktiv(side, behandling.behandlingsstegsinfo);
    }
    return true;
};

const sjekkOmSidenErAktiv = (side: ISide, behandlingsstegsinfo: IBehandlingsstegstilstand[]) => {
    return behandlingsstegsinfo
        .filter(stegInfo => aktiveBehandlingstegstatuser.includes(stegInfo.behandlingsstegstatus))
        .some(stegInfo => stegInfo.behandlingssteg === side.steg);
};

export const visSide = (side: ISide, åpenBehandling: IBehandling) => {
    if (side.steg === Behandlingssteg.BREVMOTTAKER) {
        return åpenBehandling.behandlingsstegsinfo
            .map(value => value.behandlingssteg)
            .includes(side.steg);
    }
    if (side.steg === Behandlingssteg.VERGE) {
        return !åpenBehandling.støtterManuelleBrevmottakere;
    }
    return true;
};

export const utledBehandlingSide = (steg: Behandlingssteg): ISide | undefined => {
    switch (steg) {
        case Behandlingssteg.FATTE_VEDTAK:
            return sider.FAKTA;
        case Behandlingssteg.AVSLUTTET:
        case Behandlingssteg.IVERKSETT_VEDTAK:
            return sider.VEDTAK;
        default:
            return finnSideForSteg(steg);
    }
};
const erHistoriskSide = (side: string) => side === 'inaktiv-vilkaarsvurdering';
export const erØnsketSideTilgjengelig = (ønsketSide: string, behandling: IBehandling): boolean => {
    if (erHistoriskSide(ønsketSide)) {
        return true;
    }
    const funnetØnsketSide = Object.entries(sider).find(([_, side]) => side.href === ønsketSide);

    if (funnetØnsketSide && behandling.behandlingsstegsinfo) {
        const steg = behandling.behandlingsstegsinfo.find(
            stegInfo => stegInfo.behandlingssteg === funnetØnsketSide[1].steg
        );
        return !!steg && aktiveBehandlingstegstatuser.includes(steg?.behandlingsstegstatus);
    }

    return !!funnetØnsketSide;
};

export const finnSideForSteg = (steg: Behandlingssteg): ISide | undefined => {
    const sideForSteg = Object.entries(sider).find(([_, side]) => side.steg === steg);
    return sideForSteg ? sideForSteg[1] : undefined;
};
