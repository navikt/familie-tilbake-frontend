import React from 'react';

import { AxiosError } from 'axios';
import createUseContext from 'constate';
import { useHistory } from 'react-router';

import { useHttp } from '@navikt/familie-http';
import {
    byggFeiletRessurs,
    byggHenterRessurs,
    Ressurs,
    RessursStatus,
} from '@navikt/familie-typer';

import {
    Behandlingssteg,
    Behandlingsstegstatus,
    IBehandling,
    IBehandlingsstegstilstand,
} from '../typer/behandling';
import { IFagsak } from '../typer/fagsak';
import { useFagsak } from './FagsakContext';

const erStegUtført = (status: Behandlingsstegstatus) => {
    return status === Behandlingsstegstatus.UTFØRT || status === Behandlingsstegstatus.AUTOUTFØRT;
};

const [BehandlingProvider, useBehandling] = createUseContext(() => {
    const [behandling, settBehandling] = React.useState<Ressurs<IBehandling>>();
    const [aktivtSteg, settAktivtSteg] = React.useState<IBehandlingsstegstilstand>();
    const [ventegrunn, settVentegrunn] = React.useState<IBehandlingsstegstilstand>();
    const [visVenteModal, settVisVenteModal] = React.useState<boolean>(false);
    const [harKravgrunnlag, settHarKravgrunnlag] = React.useState<boolean>();
    const [behandlingILesemodus, settBehandlingILesemodus] = React.useState<boolean>();
    const { fagsak } = useFagsak();
    const { request } = useHttp();
    const history = useHistory();

    const hentBehandlingMedEksternBrukId = (fagsak: IFagsak, behandlingId: string): void => {
        const fagsakBehandling = fagsak.behandlinger.find(
            behandling => behandling.eksternBrukId === behandlingId
        );
        if (fagsakBehandling) {
            hentBehandlingMedBehandlingId(fagsakBehandling.behandlingId);
        } else {
            settBehandling(byggFeiletRessurs('Fann ikke behandling'));
        }
    };

    const hentBehandlingMedBehandlingId = (
        behandlingId: string,
        henterEtterInnsendingAvSteg?: boolean | false
    ): void => {
        settBehandling(byggHenterRessurs());
        settAktivtSteg(undefined);
        settHarKravgrunnlag(undefined);
        settBehandlingILesemodus(undefined);
        settVentegrunn(undefined);
        settVisVenteModal(false);
        request<void, IBehandling>({
            method: 'GET',
            url: `/familie-tilbake/api/behandling/v1/${behandlingId}`,
        })
            .then((hentetBehandling: Ressurs<IBehandling>) => {
                if (hentetBehandling.status === RessursStatus.SUKSESS) {
                    const erILeseModus =
                        hentetBehandling.data.erBehandlingPåVent ||
                        hentetBehandling.data.kanEndres === false ||
                        hentetBehandling.data.behandlingsstegsinfo.some(
                            stegInfo =>
                                stegInfo.behandlingssteg === Behandlingssteg.AVSLUTTET ||
                                stegInfo.behandlingssteg === Behandlingssteg.IVERKSETT_VEDTAK ||
                                (stegInfo.behandlingssteg === Behandlingssteg.FATTE_VEDTAK &&
                                    stegInfo.behandlingsstegstatus === Behandlingsstegstatus.KLAR)
                        );
                    settBehandlingILesemodus(erILeseModus);

                    const harFåttKravgrunnlag = hentetBehandling.data.behandlingsstegsinfo.some(
                        stegInfo => stegInfo.behandlingssteg === Behandlingssteg.FAKTA
                    );
                    settHarKravgrunnlag(harFåttKravgrunnlag);

                    const funnetAktivtsteg = hentetBehandling.data.behandlingsstegsinfo.find(
                        stegInfo =>
                            stegInfo.behandlingsstegstatus === Behandlingsstegstatus.KLAR ||
                            stegInfo.behandlingsstegstatus === Behandlingsstegstatus.VENTER
                    );
                    if (funnetAktivtsteg) {
                        settAktivtSteg(funnetAktivtsteg);
                        if (
                            funnetAktivtsteg.behandlingsstegstatus === Behandlingsstegstatus.VENTER
                        ) {
                            settVentegrunn(funnetAktivtsteg);
                            settVisVenteModal(true);
                        }
                    }
                    if (henterEtterInnsendingAvSteg) {
                        history.push(
                            // @ts-ignore - fagsak er hentet på dette tidspunktet
                            `/fagsystem/${fagsak?.data?.fagsystem}/fagsak/${fagsak?.data?.eksternFagsakId}/behandling/${hentetBehandling.data.eksternBrukId}`
                        );
                    }
                }
                settBehandling(hentetBehandling);
            })
            .catch((error: AxiosError) => {
                console.log('Error: ', error);
                settBehandling(byggFeiletRessurs('Ukjent feil ved henting av behandling'));
            });
    };

    const erStegBehandlet = (steg: Behandlingssteg): boolean => {
        if (behandling?.status === RessursStatus.SUKSESS) {
            return behandling.data.behandlingsstegsinfo.some(
                stegInfo =>
                    stegInfo.behandlingssteg === steg &&
                    erStegUtført(stegInfo.behandlingsstegstatus)
            );
        }
        return false;
    };

    const erBehandlingReturnertFraBeslutter = (): boolean => {
        if (behandling?.status === RessursStatus.SUKSESS) {
            return behandling.data.behandlingsstegsinfo.some(
                stegInfo =>
                    stegInfo.behandlingssteg === Behandlingssteg.FATTE_VEDTAK &&
                    (stegInfo.behandlingsstegstatus === Behandlingsstegstatus.AVBRUTT ||
                        stegInfo.behandlingsstegstatus === Behandlingsstegstatus.TILBAKEFØRT)
            );
        }
        return false;
    };

    const erStegAutoutført = (steg: Behandlingssteg): boolean => {
        if (behandling?.status === RessursStatus.SUKSESS) {
            const behandlingSteg = behandling.data.behandlingsstegsinfo?.find(
                stegInfo => stegInfo.behandlingssteg === steg
            );
            return (
                !!behandlingSteg &&
                behandlingSteg.behandlingsstegstatus === Behandlingsstegstatus.AUTOUTFØRT
            );
        }
        return false;
    };

    const harVærtPåFatteVedtakSteget = () => {
        return (
            behandling?.status === RessursStatus.SUKSESS &&
            behandling.data.behandlingsstegsinfo.some(
                bsi => bsi.behandlingssteg === Behandlingssteg.FATTE_VEDTAK
            )
        );
    };

    return {
        behandling,
        hentBehandlingMedEksternBrukId,
        hentBehandlingMedBehandlingId,
        behandlingILesemodus,
        aktivtSteg,
        ventegrunn,
        visVenteModal,
        settVisVenteModal,
        erStegBehandlet,
        erStegAutoutført,
        erBehandlingReturnertFraBeslutter,
        harVærtPåFatteVedtakSteget,
        harKravgrunnlag,
    };
});

export { BehandlingProvider, useBehandling };
