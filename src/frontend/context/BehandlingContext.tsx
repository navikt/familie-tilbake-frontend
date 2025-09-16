import type { IBehandling, IBehandlingsstegstilstand } from '../typer/behandling';
import type { IFagsak } from '../typer/fagsak';
import type { AxiosError } from 'axios';

import createUseContext from 'constate';
import { useEffect, useState } from 'react';

import { useFagsak } from './FagsakContext';
import { useHttp } from '../api/http/HttpProvider';
import { Behandlingssteg, Behandlingsstegstatus, Behandlingstatus } from '../typer/behandling';
import {
    byggFeiletRessurs,
    byggHenterRessurs,
    type Ressurs,
    RessursStatus,
} from '../typer/ressurs';

export type BehandlingHook = {
    behandling: Ressurs<IBehandling> | undefined;
    hentBehandlingMedEksternBrukId: (fagsak: IFagsak, behandlingId: string) => void;
    hentBehandlingMedBehandlingId: (behandlingId: string) => Promise<void>;
    behandlingILesemodus: boolean | undefined;
    aktivtSteg: IBehandlingsstegstilstand | undefined;
    ventegrunn: IBehandlingsstegstilstand | undefined;
    visVenteModal: boolean;
    settVisVenteModal: (visVenteModal: boolean) => void;
    erStegBehandlet: (steg: Behandlingssteg) => boolean;
    erStegAutoutført: (steg: Behandlingssteg) => boolean;
    erBehandlingReturnertFraBeslutter: () => boolean;
    harVærtPåFatteVedtakSteget: () => boolean;
    harKravgrunnlag: boolean | undefined;
    lagLenkeTilRevurdering: () => string;
    åpenHøyremeny: boolean;
    harUlagredeData: boolean;
    settÅpenHøyremeny: (åpenHøyremeny: boolean) => void;
    visBrevmottakerModal: boolean;
    settVisBrevmottakerModal: (visBrevmottakerModal: boolean) => void;
    brevmottakerIdTilEndring?: string;
    settBrevmottakerIdTilEndring: (brevmottakerId?: string) => void;
    lukkBrevmottakerModal: () => void;
    settIkkePersistertKomponent: (komponentId: string) => void;
    nullstillIkkePersisterteKomponenter: () => void;
};

export const erStegUtført = (status: Behandlingsstegstatus): boolean => {
    return status === Behandlingsstegstatus.Utført || status === Behandlingsstegstatus.Autoutført;
};

const [BehandlingProvider, useBehandling] = createUseContext(() => {
    const [behandling, settBehandling] = useState<Ressurs<IBehandling>>();
    const [aktivtSteg, settAktivtSteg] = useState<IBehandlingsstegstilstand>();
    const [ventegrunn, settVentegrunn] = useState<IBehandlingsstegstilstand>();
    const [visVenteModal, settVisVenteModal] = useState<boolean>(false);
    const [visBrevmottakerModal, settVisBrevmottakerModal] = useState<boolean>(false);
    const [brevmottakerIdTilEndring, settBrevmottakerIdTilEndring] = useState<string | undefined>();
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

    const settIkkePersistertKomponent = (komponentId: string): void => {
        if (ikkePersisterteKomponenter.has(komponentId)) return;
        settIkkePersisterteKomponenter(new Set(ikkePersisterteKomponenter).add(komponentId));
    };

    const nullstillIkkePersisterteKomponenter = (): void => {
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
                    if (hentetBehandling.status === RessursStatus.Suksess) {
                        const erILeseModus =
                            hentetBehandling.data.status === Behandlingstatus.Avsluttet ||
                            hentetBehandling.data.erBehandlingPåVent ||
                            hentetBehandling.data.kanEndres === false ||
                            hentetBehandling.data.behandlingsstegsinfo.some(
                                stegInfo =>
                                    stegInfo.behandlingssteg === Behandlingssteg.Avsluttet ||
                                    (stegInfo.behandlingssteg === Behandlingssteg.IverksettVedtak &&
                                        stegInfo.behandlingsstegstatus !==
                                            Behandlingsstegstatus.Tilbakeført) ||
                                    (stegInfo.behandlingssteg === Behandlingssteg.FatteVedtak &&
                                        stegInfo.behandlingsstegstatus ===
                                            Behandlingsstegstatus.Klar)
                            );
                        settBehandlingILesemodus(erILeseModus);

                        const harFåttKravgrunnlag = hentetBehandling.data.behandlingsstegsinfo.some(
                            stegInfo => stegInfo.behandlingssteg === Behandlingssteg.Fakta
                        );
                        settHarKravgrunnlag(harFåttKravgrunnlag);

                        const funnetAktivtsteg =
                            hentetBehandling.data.status === Behandlingstatus.Avsluttet
                                ? null
                                : hentetBehandling.data.behandlingsstegsinfo.find(
                                      stegInfo =>
                                          stegInfo.behandlingsstegstatus ===
                                              Behandlingsstegstatus.Klar ||
                                          stegInfo.behandlingsstegstatus ===
                                              Behandlingsstegstatus.Venter
                                  );
                        if (funnetAktivtsteg) {
                            settAktivtSteg(funnetAktivtsteg);
                            if (
                                funnetAktivtsteg.behandlingsstegstatus ===
                                Behandlingsstegstatus.Venter
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
        if (behandling?.status === RessursStatus.Suksess) {
            return behandling.data.behandlingsstegsinfo.some(
                stegInfo =>
                    stegInfo.behandlingssteg === steg &&
                    erStegUtført(stegInfo.behandlingsstegstatus)
            );
        }
        return false;
    };

    const erBehandlingReturnertFraBeslutter = (): boolean => {
        if (behandling?.status === RessursStatus.Suksess) {
            return behandling.data.behandlingsstegsinfo.some(
                stegInfo =>
                    stegInfo.behandlingssteg === Behandlingssteg.FatteVedtak &&
                    (stegInfo.behandlingsstegstatus === Behandlingsstegstatus.Avbrutt ||
                        stegInfo.behandlingsstegstatus === Behandlingsstegstatus.Tilbakeført)
            );
        }
        return false;
    };

    const erStegAutoutført = (steg: Behandlingssteg): boolean => {
        if (behandling?.status === RessursStatus.Suksess) {
            const behandlingSteg = behandling.data.behandlingsstegsinfo?.find(
                stegInfo => stegInfo.behandlingssteg === steg
            );
            return (
                !!behandlingSteg &&
                behandlingSteg.behandlingsstegstatus === Behandlingsstegstatus.Autoutført
            );
        }
        return false;
    };

    const harVærtPåFatteVedtakSteget = (): boolean => {
        return (
            behandling?.status === RessursStatus.Suksess &&
            behandling.data.behandlingsstegsinfo.some(
                bsi => bsi.behandlingssteg === Behandlingssteg.FatteVedtak
            )
        );
    };

    const lagLenkeTilRevurdering = (): string => {
        return fagsak?.status === RessursStatus.Suksess &&
            behandling?.status === RessursStatus.Suksess
            ? `/redirect/fagsystem/${fagsak.data.fagsystem}/fagsak/${fagsak.data.eksternFagsakId}/${behandling.data.fagsystemsbehandlingId}`
            : '#';
    };

    const lukkBrevmottakerModal = (): void => {
        settVisBrevmottakerModal(false);
        settBrevmottakerIdTilEndring(undefined);
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
        brevmottakerIdTilEndring,
        settBrevmottakerIdTilEndring,
        lukkBrevmottakerModal,
        settIkkePersistertKomponent,
        nullstillIkkePersisterteKomponenter,
    };
});

export { BehandlingProvider, useBehandling };
