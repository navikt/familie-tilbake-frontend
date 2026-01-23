import type { BehandlingsstegEnum } from '../generated/types.gen';
import type { Behandlingsstegstilstand } from '../typer/behandling';
import type { ReactNode } from 'react';

import * as React from 'react';
import { createContext, useContext, useMemo } from 'react';

import { useBehandling } from './BehandlingContext';
import { useUlagretEndringer, type UseUlagretEndringerReturn } from '../hooks/useUlagretEndringer';
import { SYNLIGE_STEG } from '../utils/sider';

export const erStegUtført = (status: string): boolean => {
    return status === 'UTFØRT' || status === 'AUTOUTFØRT';
};

export type BehandlingStateContextType = UseUlagretEndringerReturn & {
    behandlingILesemodus: boolean;
    aktivtSteg: Behandlingsstegstilstand | undefined;
    ventegrunn: Behandlingsstegstilstand | undefined;
    harKravgrunnlag: boolean;
    actionBarStegtekst: (valgtSteg: BehandlingsstegEnum) => string | undefined;
    erStegBehandlet: (steg: BehandlingsstegEnum) => boolean;
    erStegAutoutført: (steg: BehandlingsstegEnum) => boolean;
    erBehandlingReturnertFraBeslutter: () => boolean;
    harVærtPåFatteVedtakSteget: () => boolean;
};

export const BehandlingStateContext = createContext<BehandlingStateContextType | undefined>(
    undefined
);

type Props = {
    children: ReactNode;
};

export const BehandlingStateProvider = ({ children }: Props): React.ReactElement => {
    const behandling = useBehandling();
    const ulagretEndringer = useUlagretEndringer();

    const behandlingILesemodus = useMemo((): boolean => {
        return (
            behandling.status === 'AVSLUTTET' ||
            behandling.erBehandlingPåVent ||
            behandling.kanEndres === false ||
            behandling.behandlingsstegsinfo.some(
                stegInfo =>
                    stegInfo.behandlingssteg === 'AVSLUTTET' ||
                    (stegInfo.behandlingssteg === 'IVERKSETT_VEDTAK' &&
                        stegInfo.behandlingsstegstatus !== 'TILBAKEFØRT') ||
                    (stegInfo.behandlingssteg === 'FATTE_VEDTAK' &&
                        stegInfo.behandlingsstegstatus === 'KLAR')
            )
        );
    }, [behandling]);

    const harKravgrunnlag = useMemo((): boolean => {
        return behandling.behandlingsstegsinfo.some(
            stegInfo => stegInfo.behandlingssteg === 'FAKTA'
        );
    }, [behandling]);

    const aktivtSteg = useMemo((): Behandlingsstegstilstand | undefined => {
        if (behandling.status === 'AVSLUTTET') {
            return undefined;
        }
        const steg = behandling.behandlingsstegsinfo.find(
            ({ behandlingsstegstatus }) =>
                behandlingsstegstatus === 'KLAR' || behandlingsstegstatus === 'VENTER'
        );
        return steg as Behandlingsstegstilstand | undefined;
    }, [behandling]);

    const ventegrunn = useMemo((): Behandlingsstegstilstand | undefined => {
        const steg = behandling.behandlingsstegsinfo.find(
            stegInfo => stegInfo.behandlingsstegstatus === 'VENTER'
        );
        return steg as Behandlingsstegstilstand | undefined;
    }, [behandling]);

    const actionBarStegtekst = (valgtSteg: BehandlingsstegEnum): string | undefined => {
        const antallSynligeSteg = Object.values(SYNLIGE_STEG).filter(({ steg }) => {
            if (steg === 'VERGE' || steg === 'BREVMOTTAKER' || steg === 'FORHÅNDSVARSEL') {
                return behandling.behandlingsstegsinfo.some(
                    ({ behandlingssteg }) => behandlingssteg === steg
                );
            }
            return true;
        });
        const aktivtStegnummer = antallSynligeSteg.findIndex(({ steg }) => steg === valgtSteg) + 1;

        return `Steg ${aktivtStegnummer} av ${antallSynligeSteg.length}`;
    };

    const erStegBehandlet = (steg: BehandlingsstegEnum): boolean => {
        return behandling.behandlingsstegsinfo.some(
            stegInfo =>
                stegInfo.behandlingssteg === steg && erStegUtført(stegInfo.behandlingsstegstatus)
        );
    };

    const erBehandlingReturnertFraBeslutter = (): boolean => {
        return behandling.behandlingsstegsinfo.some(
            stegInfo =>
                stegInfo.behandlingssteg === 'FATTE_VEDTAK' &&
                (stegInfo.behandlingsstegstatus === 'AVBRUTT' ||
                    stegInfo.behandlingsstegstatus === 'TILBAKEFØRT')
        );
    };

    const erStegAutoutført = (steg: BehandlingsstegEnum): boolean => {
        const behandlingSteg = behandling.behandlingsstegsinfo?.find(
            stegInfo => stegInfo.behandlingssteg === steg
        );
        return !!behandlingSteg && behandlingSteg.behandlingsstegstatus === 'AUTOUTFØRT';
    };

    const harVærtPåFatteVedtakSteget = (): boolean =>
        behandling.behandlingsstegsinfo.some(
            ({ behandlingssteg }) => behandlingssteg === 'FATTE_VEDTAK'
        );

    const contextValue: BehandlingStateContextType = {
        behandlingILesemodus,
        aktivtSteg,
        ventegrunn,
        harKravgrunnlag,
        actionBarStegtekst,
        erStegBehandlet,
        erStegAutoutført,
        erBehandlingReturnertFraBeslutter,
        harVærtPåFatteVedtakSteget,
        ...ulagretEndringer,
    };

    return (
        <BehandlingStateContext.Provider value={contextValue}>
            {children}
        </BehandlingStateContext.Provider>
    );
};

export const useBehandlingState = (): BehandlingStateContextType => {
    const context = useContext(BehandlingStateContext);
    if (!context) {
        throw new Error('useBehandlingState må brukes innenfor BehandlingStateProvider');
    }
    return context;
};
