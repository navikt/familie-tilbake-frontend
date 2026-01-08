import type {
    BehandlingsoppsummeringDto,
    BehandlingDto,
    BehandlingsstegEnum,
} from '../generated/types.gen';
import type { Behandlingsstegstilstand } from '../typer/behandling';
import type { ReactNode } from 'react';

import { useSuspenseQuery } from '@tanstack/react-query';
import * as React from 'react';
import { createContext, useContext, useMemo } from 'react';

import { hentBehandlingOptions } from '../generated/@tanstack/react-query.gen';
import { useUnsavedChanges, type UseUnsavedChangesReturn } from '../hooks/useUnsavedChanges';
import { SYNLIGE_STEG } from '../utils/sider';

/**
 * Hjelper-funksjon for å finne behandlingId fra eksternBrukId
 */
export const finnBehandlingId = (
    behandlinger: BehandlingsoppsummeringDto[],
    eksternBrukId: string
): string | undefined => {
    const behandling = behandlinger.find(b => b.eksternBrukId === eksternBrukId);
    return behandling?.behandlingId;
};

export type BehandlingContextType = UseUnsavedChangesReturn & {
    behandling: BehandlingDto;
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

export const BehandlingContext = createContext<BehandlingContextType | undefined>(undefined);

export const erStegUtført = (status: string): boolean => {
    return status === 'UTFØRT' || status === 'AUTOUTFØRT';
};

type Props = {
    behandlingId: string;
    children: ReactNode;
};

export const BehandlingProvider = ({ behandlingId, children }: Props): React.ReactElement => {
    const { data: behandlingResponse } = useSuspenseQuery(
        hentBehandlingOptions({
            path: {
                behandlingId,
            },
        })
    );

    const unsavedChanges = useUnsavedChanges();

    const behandling = useMemo((): BehandlingDto => {
        if (!behandlingResponse?.data) {
            throw new Error('Kunne ikke laste behandling');
        }
        return behandlingResponse.data;
    }, [behandlingResponse]);

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
            stegInfo =>
                stegInfo.behandlingsstegstatus === 'KLAR' ||
                stegInfo.behandlingsstegstatus === 'VENTER'
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

    const harVærtPåFatteVedtakSteget = (): boolean => {
        return behandling.behandlingsstegsinfo.some(bsi => bsi.behandlingssteg === 'FATTE_VEDTAK');
    };

    const contextValue: BehandlingContextType = {
        behandling,
        behandlingILesemodus,
        aktivtSteg,
        ventegrunn,
        harKravgrunnlag,
        actionBarStegtekst,
        erStegBehandlet,
        erStegAutoutført,
        erBehandlingReturnertFraBeslutter,
        harVærtPåFatteVedtakSteget,
        ...unsavedChanges,
    };

    return <BehandlingContext.Provider value={contextValue}>{children}</BehandlingContext.Provider>;
};

export const useBehandling = (): BehandlingContextType => {
    const context = useContext(BehandlingContext);
    if (!context) {
        throw new Error('useBehandling må brukes innenfor BehandlingProvider');
    }
    return context;
};

// Export type alias for backwards compatibility with tests
export type BehandlingHook = BehandlingContextType;
