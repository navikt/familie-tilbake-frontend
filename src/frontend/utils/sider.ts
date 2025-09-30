import type { IBehandling, IBehandlingsstegstilstand } from '../typer/behandling';

import { Behandlingssteg, Behandlingsstegstatus } from '../typer/behandling';

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

const sjekkOmSidenErAktiv = (
    side: SynligSteg,
    behandlingsstegsinfo: IBehandlingsstegstilstand[]
): boolean => {
    return behandlingsstegsinfo
        .filter(stegInfo => aktiveBehandlingstegstatuser.includes(stegInfo.behandlingsstegstatus))
        .some(stegInfo => stegInfo.behandlingssteg === side.steg);
};

export const erSidenAktiv = (synligSteg: SynligSteg, behandling: IBehandling): boolean => {
    if (!behandling.behandlingsstegsinfo) return true;

    if (synligSteg === SYNLIGE_STEG.VERGE) {
        return (
            behandling.harVerge || sjekkOmSidenErAktiv(synligSteg, behandling.behandlingsstegsinfo)
        );
    }

    return sjekkOmSidenErAktiv(synligSteg, behandling.behandlingsstegsinfo);
};

export const visSide = (steg: Behandlingssteg, behandling: IBehandling): boolean => {
    if (steg === Behandlingssteg.Brevmottaker) {
        return behandling.behandlingsstegsinfo
            .filter(
                ({ behandlingsstegstatus }) =>
                    behandlingsstegstatus !== Behandlingsstegstatus.Tilbakeført
            )
            .some(({ behandlingssteg }) => behandlingssteg === steg);
    }
    if (steg === Behandlingssteg.Verge) {
        return !behandling.støtterManuelleBrevmottakere;
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

export const erØnsketSideTilgjengelig = (
    ønsketSide: string,
    behandlingssteginfo: IBehandlingsstegstilstand[]
): boolean => {
    if (erHistoriskSide(ønsketSide)) return true;

    const funnetØnsketSide = Object.values(SYNLIGE_STEG).find(({ href }) => href === ønsketSide);

    if (funnetØnsketSide && behandlingssteginfo) {
        const steg = behandlingssteginfo.find(
            ({ behandlingssteg }) => behandlingssteg === funnetØnsketSide.steg
        );
        return !!steg && aktiveBehandlingstegstatuser.includes(steg?.behandlingsstegstatus);
    }

    return !!funnetØnsketSide;
};

export const finnSideForSteg = (behandlingssteg: Behandlingssteg): SynligSteg | undefined => {
    return Object.values(SYNLIGE_STEG).find(({ steg }) => steg === behandlingssteg);
};
