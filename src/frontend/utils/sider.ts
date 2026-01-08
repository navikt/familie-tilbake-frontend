import type { Behandling, Behandlingsstegstilstand } from '../typer/behandling';

import { useNavigate } from 'react-router';

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
    | Behandlingssteg.Forhåndsvarsel
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
    [Behandlingssteg.Forhåndsvarsel]: {
        href: 'forhaandsvarsel',
        navn: 'Forhåndsvarsel',
        steg: Behandlingssteg.Forhåndsvarsel,
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

export const useStegNavigering = (
    behandlingUrl: string,
    steg: SynligeStegType
): (() => Promise<void> | void) => {
    const navigate = useNavigate();
    return () => navigate(`${behandlingUrl}/${SYNLIGE_STEG[steg].href}`);
};

const sjekkOmSidenErAktiv = (
    side: SynligSteg,
    behandlingsstegsinfo: Behandlingsstegstilstand[]
): boolean => {
    return behandlingsstegsinfo
        .filter(stegInfo => aktiveBehandlingstegstatuser.includes(stegInfo.behandlingsstegstatus))
        .some(stegInfo => stegInfo.behandlingssteg === side.steg);
};

export const erSidenAktiv = (synligSteg: SynligSteg, behandling: Behandling): boolean => {
    if (!behandling.behandlingsstegsinfo) return true;

    if (synligSteg === SYNLIGE_STEG.VERGE) {
        return (
            behandling.harVerge || sjekkOmSidenErAktiv(synligSteg, behandling.behandlingsstegsinfo)
        );
    }

    return sjekkOmSidenErAktiv(synligSteg, behandling.behandlingsstegsinfo);
};

export const visSide = (steg: Behandlingssteg, behandling: Behandling): boolean => {
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
    if (steg === Behandlingssteg.Forhåndsvarsel) {
        const harVarselSteg = behandling.behandlingsstegsinfo.some(
            ({ behandlingssteg }) => behandlingssteg === Behandlingssteg.Forhåndsvarsel
        );
        return harVarselSteg;
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
    behandlingssteginfo: Behandlingsstegstilstand[]
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
