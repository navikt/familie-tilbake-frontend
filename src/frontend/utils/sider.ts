import type {
    BehandlingDto,
    BehandlingsstegEnum,
    BehandlingsstegsinfoDto,
    BehandlingsstegstatusEnum,
} from '~/generated';

import { useNavigate } from 'react-router';

import { useBehandling } from '~/context/BehandlingContext';
import { useFagsak } from '~/context/FagsakContext';

export type SynligSteg = {
    href: string;
    navn: string;
    steg: BehandlingsstegEnum;
};

export type SynligeStegType =
    | 'BREVMOTTAKER'
    | 'FAKTA'
    | 'FORELDELSE'
    | 'FORESLÅ_VEDTAK'
    | 'FORHÅNDSVARSEL'
    | 'VERGE'
    | 'VILKÅRSVURDERING';

export const SYNLIGE_STEG: Record<SynligeStegType, SynligSteg> = {
    ['BREVMOTTAKER']: {
        href: 'brevmottakere',
        navn: 'Brevmottaker(e)',
        steg: 'BREVMOTTAKER',
    },
    ['VERGE']: {
        href: 'verge',
        navn: 'Verge',
        steg: 'VERGE',
    },
    ['FAKTA']: {
        href: 'fakta',
        navn: 'Fakta',
        steg: 'FAKTA',
    },
    ['FORHÅNDSVARSEL']: {
        href: 'forhaandsvarsel',
        navn: 'Forhåndsvarsel',
        steg: 'FORHÅNDSVARSEL',
    },
    ['FORELDELSE']: {
        href: 'foreldelse',
        navn: 'Foreldelse',
        steg: 'FORELDELSE',
    },
    ['VILKÅRSVURDERING']: {
        href: 'vilkaarsvurdering',
        navn: 'Vilkårsvurdering',
        steg: 'VILKÅRSVURDERING',
    },
    ['FORESLÅ_VEDTAK']: {
        href: 'vedtak',
        navn: 'Vedtak',
        steg: 'FORESLÅ_VEDTAK',
    },
};

const aktiveBehandlingstegstatuser: BehandlingsstegstatusEnum[] = [
    'UTFØRT',
    'AUTOUTFØRT',
    'KLAR',
    'VENTER',
];

export const useStegNavigering = (steg?: SynligeStegType): (() => Promise<void> | void) => {
    const { fagsystem, eksternFagsakId } = useFagsak();
    const { eksternBrukId } = useBehandling();
    const navigate = useNavigate();
    const url = `/fagsystem/${fagsystem}/fagsak/${eksternFagsakId}/behandling/${eksternBrukId}${steg ? `/${SYNLIGE_STEG[steg].href}` : ''}`;
    return () => navigate(url);
};

const sjekkOmSidenErAktiv = (
    side: SynligSteg,
    behandlingsstegsinfo: BehandlingsstegsinfoDto[]
): boolean => {
    return behandlingsstegsinfo
        .filter(stegInfo => aktiveBehandlingstegstatuser.includes(stegInfo.behandlingsstegstatus))
        .some(stegInfo => stegInfo.behandlingssteg === side.steg);
};

export const erSidenAktiv = (synligSteg: SynligSteg, behandling: BehandlingDto): boolean => {
    if (!behandling.behandlingsstegsinfo) return true;

    if (synligSteg === SYNLIGE_STEG.VERGE) {
        return (
            behandling.harVerge || sjekkOmSidenErAktiv(synligSteg, behandling.behandlingsstegsinfo)
        );
    }

    return sjekkOmSidenErAktiv(synligSteg, behandling.behandlingsstegsinfo);
};

export const visSide = (steg: BehandlingsstegEnum, behandling: BehandlingDto): boolean => {
    if (steg === 'BREVMOTTAKER') {
        return behandling.behandlingsstegsinfo
            .filter(({ behandlingsstegstatus }) => behandlingsstegstatus !== 'TILBAKEFØRT')
            .some(({ behandlingssteg }) => behandlingssteg === steg);
    }
    if (steg === 'VERGE') {
        return !behandling.støtterManuelleBrevmottakere;
    }
    if (steg === 'FORHÅNDSVARSEL') {
        return behandling.erNyModell;
    }

    return true;
};

export const utledBehandlingSide = (steg: BehandlingsstegEnum): SynligSteg | undefined => {
    switch (steg) {
        case 'FATTE_VEDTAK':
            return SYNLIGE_STEG.FAKTA;
        case 'AVSLUTTET':
        case 'IVERKSETT_VEDTAK':
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
    behandlingssteginfo: BehandlingsstegsinfoDto[]
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

export const finnSideForSteg = (behandlingssteg: BehandlingsstegEnum): SynligSteg | undefined => {
    return Object.values(SYNLIGE_STEG).find(({ steg }) => steg === behandlingssteg);
};
