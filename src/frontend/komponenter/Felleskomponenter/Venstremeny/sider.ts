import type { IBehandling, IBehandlingsstegstilstand } from '../../../typer/behandling';

import { Behandlingssteg, Behandlingsstegstatus } from '../../../typer/behandling';

export interface ISide {
    href: string;
    navn: string;
    steg: Behandlingssteg;
}

enum SideId {
    Fakta = 'FAKTA',
    Foreldelse = 'FORELDELSE',
    Vilkårsvurdering = 'VILKÅRSVURDERING',
    Verge = 'VERGE',
    Vedtak = 'VEDTAK',
    Brevmottaker = 'BREVMOTTAKER',
}

export const sider: Record<SideId, ISide> = {
    [SideId.Brevmottaker]: {
        href: 'brevmottakere',
        navn: 'Brevmottaker(e)',
        steg: Behandlingssteg.Brevmottaker,
    },
    [SideId.Verge]: {
        href: 'verge',
        navn: 'Verge',
        steg: Behandlingssteg.Verge,
    },
    [SideId.Fakta]: {
        href: 'fakta',
        navn: 'Fakta',
        steg: Behandlingssteg.Fakta,
    },
    [SideId.Foreldelse]: {
        href: 'foreldelse',
        navn: 'Foreldelse',
        steg: Behandlingssteg.Foreldelse,
    },
    [SideId.Vilkårsvurdering]: {
        href: 'vilkaarsvurdering',
        navn: 'Vilkårsvurdering',
        steg: Behandlingssteg.Vilkårsvurdering,
    },
    [SideId.Vedtak]: {
        href: 'vedtak',
        navn: 'Vedtak',
        steg: Behandlingssteg.ForeslåVedtak,
    },
};

const aktiveBehandlingstegstatuser = [
    Behandlingsstegstatus.Utført,
    Behandlingsstegstatus.Autoutført,
    Behandlingsstegstatus.Klar,
    Behandlingsstegstatus.Venter,
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
    if (side.steg === Behandlingssteg.Brevmottaker) {
        return åpenBehandling.behandlingsstegsinfo
            .map(value => value.behandlingssteg)
            .includes(side.steg);
    }
    if (side.steg === Behandlingssteg.Verge) {
        return !åpenBehandling.støtterManuelleBrevmottakere;
    }
    return true;
};

export const utledBehandlingSide = (steg: Behandlingssteg): ISide | undefined => {
    switch (steg) {
        case Behandlingssteg.FatteVedtak:
            return sider.FAKTA;
        case Behandlingssteg.Avsluttet:
        case Behandlingssteg.IverksettVedtak:
            return sider.VEDTAK;
        default:
            return finnSideForSteg(steg);
    }
};

const historiskeSider = [
    'inaktiv-vilkaarsvurdering',
    'inaktiv-fakta',
    'inaktiv-foreldelse',
    'inaktiv-vedtak',
    'inaktiv',
];

export const erHistoriskSide = (side: string) => {
    return historiskeSider.includes(side);
};
export const erØnsketSideTilgjengelig = (ønsketSide: string, behandling: IBehandling): boolean => {
    if (erHistoriskSide(ønsketSide)) {
        return true;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const sideForSteg = Object.entries(sider).find(([_, side]) => side.steg === steg);
    return sideForSteg ? sideForSteg[1] : undefined;
};
