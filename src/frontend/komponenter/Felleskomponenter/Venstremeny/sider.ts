import type { IBehandling, IBehandlingsstegstilstand } from '../../../typer/behandling';

import { Behandlingssteg, Behandlingsstegstatus } from '../../../typer/behandling';

export type SynligSteg = {
    href: string;
    navn: string;
    steg: Behandlingssteg;
};

type SynligeStegType =
    | Behandlingssteg.Brevmottaker
    | Behandlingssteg.Fakta
    | Behandlingssteg.Foreldelse
    | Behandlingssteg.ForeslåVedtak
    | Behandlingssteg.Verge
    | Behandlingssteg.Vilkårsvurdering;

export const SYNLIGE_STEG: Record<SynligeStegType, SynligSteg> = {
    [Behandlingssteg.Brevmottaker]: {
        href: 'brevmottakere',
        navn: 'Brevmottaker(e)',
        steg: Behandlingssteg.Brevmottaker,
    },
    [Behandlingssteg.Verge]: {
        href: 'verge',
        navn: 'Verge',
        steg: Behandlingssteg.Verge,
    },
    [Behandlingssteg.Fakta]: {
        href: 'fakta',
        navn: 'Fakta',
        steg: Behandlingssteg.Fakta,
    },
    [Behandlingssteg.Foreldelse]: {
        href: 'foreldelse',
        navn: 'Foreldelse',
        steg: Behandlingssteg.Foreldelse,
    },
    [Behandlingssteg.Vilkårsvurdering]: {
        href: 'vilkaarsvurdering',
        navn: 'Vilkårsvurdering',
        steg: Behandlingssteg.Vilkårsvurdering,
    },
    [Behandlingssteg.ForeslåVedtak]: {
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

export const erSidenAktiv = (side: SynligSteg, behandling: IBehandling): boolean => {
    if (side === SYNLIGE_STEG.VERGE) {
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

const sjekkOmSidenErAktiv = (
    side: SynligSteg,
    behandlingsstegsinfo: IBehandlingsstegstilstand[]
): boolean => {
    return behandlingsstegsinfo
        .filter(stegInfo => aktiveBehandlingstegstatuser.includes(stegInfo.behandlingsstegstatus))
        .some(stegInfo => stegInfo.behandlingssteg === side.steg);
};

export const visSide = (side: SynligSteg, åpenBehandling: IBehandling): boolean => {
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

export const utledBehandlingSide = (steg: Behandlingssteg): SynligSteg | undefined => {
    switch (steg) {
        case Behandlingssteg.FatteVedtak:
            return SYNLIGE_STEG.FAKTA;
        case Behandlingssteg.Avsluttet:
        case Behandlingssteg.IverksettVedtak:
            return SYNLIGE_STEG.FORESLÅ_VEDTAK;
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

export const erHistoriskSide = (side: string): boolean => {
    return historiskeSider.includes(side);
};
export const erØnsketSideTilgjengelig = (ønsketSide: string, behandling: IBehandling): boolean => {
    if (erHistoriskSide(ønsketSide)) {
        return true;
    }

    const funnetØnsketSide = Object.entries(SYNLIGE_STEG).find(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ([_, side]) => side.href === ønsketSide
    );

    if (funnetØnsketSide && behandling.behandlingsstegsinfo) {
        const steg = behandling.behandlingsstegsinfo.find(
            stegInfo => stegInfo.behandlingssteg === funnetØnsketSide[1].steg
        );
        return !!steg && aktiveBehandlingstegstatuser.includes(steg?.behandlingsstegstatus);
    }

    return !!funnetØnsketSide;
};

export const finnSideForSteg = (steg: Behandlingssteg): SynligSteg | undefined => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const sideForSteg = Object.entries(SYNLIGE_STEG).find(([_, side]) => side.steg === steg);
    return sideForSteg ? sideForSteg[1] : undefined;
};
