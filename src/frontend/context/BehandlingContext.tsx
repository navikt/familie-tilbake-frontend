import { useEffect, useState } from 'react';

import { AxiosError } from 'axios';
import createUseContext from 'constate';

import { useHttp } from '@navikt/familie-http';

import { useFagsak } from './FagsakContext';
import {
    Behandlingssteg,
    Behandlingsstegstatus,
    Behandlingstatus,
    IBehandling,
    IBehandlingsstegstilstand,
} from '../typer/behandling';
import { IFagsak } from '../typer/fagsak';
import {
    byggFeiletRessurs,
    byggHenterRessurs,
    type Ressurs,
    RessursStatus,
} from '../typer/ressurs';

const erStegUtført = (status: Behandlingsstegstatus) => {
    return status === Behandlingsstegstatus.UTFØRT || status === Behandlingsstegstatus.AUTOUTFØRT;
};

const [BehandlingProvider, useBehandling] = createUseContext(() => {
    const [behandling, settBehandling] = useState<Ressurs<IBehandling>>();
    const [aktivtSteg, settAktivtSteg] = useState<IBehandlingsstegstilstand>();
    const [ventegrunn, settVentegrunn] = useState<IBehandlingsstegstilstand>();
    const [visVenteModal, settVisVenteModal] = useState<boolean>(false);
    const [visBrevmottakerModal, settVisBrevmottakerModal] = useState<boolean>(false);
    const [harKravgrunnlag, settHarKravgrunnlag] = useState<boolean>();
    const [behandlingILesemodus, settBehandlingILesemodus] = useState<boolean>();
    const [åpenHøyremeny, settÅpenHøyremeny] = useState(true);
    const [ikkePersisterteKomponenter, settIkkePersisterteKomponenter] = useState<Set<string>>(
        new Set()
    );
    const [harUlagredeData, settHarUlagredeData] = useState<boolean>(
        ikkePersisterteKomponenter.size > 0
    );
    const { fagsak } = useFagsak();
    const { request } = useHttp();

    useEffect(
        () => settHarUlagredeData(ikkePersisterteKomponenter.size > 0),
        [ikkePersisterteKomponenter]
    );

    const settIkkePersistertKomponent = (komponentId: string) => {
        if (ikkePersisterteKomponenter.has(komponentId)) return;
        settIkkePersisterteKomponenter(new Set(ikkePersisterteKomponenter).add(komponentId));
    };

    const nullstillIkkePersisterteKomponenter = () => {
        if (ikkePersisterteKomponenter.size > 0) {
            settIkkePersisterteKomponenter(new Set());
        }
    };

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

    const hentBehandlingMedBehandlingId = (behandlingId: string): Promise<void> => {
        settBehandling(byggHenterRessurs());
        settAktivtSteg(undefined);
        settHarKravgrunnlag(undefined);
        settBehandlingILesemodus(undefined);
        settVentegrunn(undefined);
        settVisVenteModal(false);
        return (
            request<void, IBehandling>({
                method: 'GET',
                url: `/familie-tilbake/api/behandling/v1/${behandlingId}`,
            })
                .then((hentetBehandling: Ressurs<IBehandling>) => {
                    if (hentetBehandling.status === RessursStatus.SUKSESS) {
                        const erILeseModus =
                            hentetBehandling.data.status === Behandlingstatus.AVSLUTTET ||
                            hentetBehandling.data.erBehandlingPåVent ||
                            hentetBehandling.data.kanEndres === false ||
                            hentetBehandling.data.behandlingsstegsinfo.some(
                                stegInfo =>
                                    stegInfo.behandlingssteg === Behandlingssteg.AVSLUTTET ||
                                    (stegInfo.behandlingssteg ===
                                        Behandlingssteg.IVERKSETT_VEDTAK &&
                                        stegInfo.behandlingsstegstatus !==
                                            Behandlingsstegstatus.TILBAKEFØRT) ||
                                    (stegInfo.behandlingssteg === Behandlingssteg.FATTE_VEDTAK &&
                                        stegInfo.behandlingsstegstatus ===
                                            Behandlingsstegstatus.KLAR)
                            );
                        settBehandlingILesemodus(erILeseModus);

                        const harFåttKravgrunnlag = hentetBehandling.data.behandlingsstegsinfo.some(
                            stegInfo => stegInfo.behandlingssteg === Behandlingssteg.FAKTA
                        );
                        settHarKravgrunnlag(harFåttKravgrunnlag);

                        const funnetAktivtsteg =
                            hentetBehandling.data.status === Behandlingstatus.AVSLUTTET
                                ? null
                                : hentetBehandling.data.behandlingsstegsinfo.find(
                                      stegInfo =>
                                          stegInfo.behandlingsstegstatus ===
                                              Behandlingsstegstatus.KLAR ||
                                          stegInfo.behandlingsstegstatus ===
                                              Behandlingsstegstatus.VENTER
                                  );
                        if (funnetAktivtsteg) {
                            settAktivtSteg(funnetAktivtsteg);
                            if (
                                funnetAktivtsteg.behandlingsstegstatus ===
                                Behandlingsstegstatus.VENTER
                            ) {
                                settVentegrunn(funnetAktivtsteg);
                                settVisVenteModal(true);
                            }
                        }
                    }
                    settBehandling(hentetBehandling);
                })
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                .catch((_error: AxiosError) => {
                    settBehandling(byggFeiletRessurs('Ukjent feil ved henting av behandling'));
                })
        );
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

    const lagLenkeTilRevurdering = () => {
        return fagsak?.status === RessursStatus.SUKSESS &&
            behandling?.status === RessursStatus.SUKSESS
            ? `/redirect/fagsystem/${fagsak.data.fagsystem}/fagsak/${fagsak.data.eksternFagsakId}/${behandling.data.fagsystemsbehandlingId}`
            : '#';
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
        lagLenkeTilRevurdering,
        åpenHøyremeny,
        harUlagredeData,
        settÅpenHøyremeny,
        visBrevmottakerModal,
        settVisBrevmottakerModal,
        settIkkePersistertKomponent,
        nullstillIkkePersisterteKomponenter,
    };
});

export { BehandlingProvider, useBehandling };
