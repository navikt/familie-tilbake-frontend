import type { Behandlingsstegstilstand, Venteårsak } from '../../typer/behandling';

import classNames from 'classnames';
import * as React from 'react';
import { useEffect } from 'react';
import { useLocation, useParams } from 'react-router';

import BehandlingContainer from './BehandlingContainer';
import { useBehandling } from '../../context/BehandlingContext';
import { useFagsak } from '../../context/FagsakContext';
import { Fagsystem } from '../../kodeverk';
import { useBehandlingStore } from '../../stores/behandlingStore';
import { useFagsakStore } from '../../stores/fagsakStore';
import { venteårsaker } from '../../typer/behandling';
import { RessursStatus } from '../../typer/ressurs';
import { formatterDatostring } from '../../utils';
import DataLastIkkeSuksess from '../Felleskomponenter/Datalast/DataLastIkkeSuksess';
import { FTAlertStripe } from '../Felleskomponenter/Flytelementer';
import HenterBehandling from '../Felleskomponenter/Modal/HenterBehandling';
import PåVentModal from '../Felleskomponenter/Modal/PåVent/PåVentModal';

const venteBeskjed = (ventegrunn: Behandlingsstegstilstand): string => {
    return `Behandlingen er satt på vent: ${
        venteårsaker[ventegrunn.venteårsak as Venteårsak]
    }. Tidsfrist: ${formatterDatostring(ventegrunn.tidsfrist as string)}`;
};

const FagsakContainer: React.FC = () => {
    const { fagsystem: fagsystemParam, fagsakId: eksternFagsakId } = useParams();
    const fagsystem = Fagsystem[fagsystemParam as keyof typeof Fagsystem];

    const location = useLocation();
    const behandlingId = location.pathname.split('/')[6];

    const { fagsak, hentFagsak } = useFagsak();
    const {
        behandling,
        hentBehandlingMedEksternBrukId,
        ventegrunn,
        visVenteModal,
        settVisVenteModal,
    } = useBehandling();

    const setPersonIdent = useBehandlingStore(state => state.setPersonIdent);
    const setBehandlingId = useBehandlingStore(state => state.setBehandlingId);
    const setEksternFagsakId = useFagsakStore(state => state.setEksternFagsakId);
    const setFagSystem = useFagsakStore(state => state.setFagsystem);
    const setYtelsestype = useFagsakStore(state => state.setYtelsestype);
    const setSpråkkode = useFagsakStore(state => state.setSpråkkode);

    useEffect(() => {
        if (!!fagsystem && !!eksternFagsakId) {
            hentFagsak(fagsystem, eksternFagsakId);
        }
        return (): void => {
            setEksternFagsakId(undefined);
            setYtelsestype(undefined);
            setFagSystem(undefined);
            setSpråkkode(undefined);
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fagsystem, eksternFagsakId]);

    useEffect(() => {
        if (fagsak?.status === RessursStatus.Suksess && behandlingId) {
            hentBehandlingMedEksternBrukId(fagsak.data, behandlingId);
            setBehandlingId(behandlingId);
        }

        if (fagsak?.status === RessursStatus.Suksess && fagsak?.data?.bruker.personIdent) {
            setPersonIdent(fagsak.data.bruker.personIdent);
        }
        return (): void => {
            setBehandlingId(undefined);
            setPersonIdent(undefined);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fagsak, behandlingId]);

    if (fagsak?.status === RessursStatus.Henter || behandling?.status === RessursStatus.Henter) {
        return <HenterBehandling />;
    }

    if (fagsak?.status === RessursStatus.Suksess && behandling?.status === RessursStatus.Suksess) {
        // TODO kanskje fjerne denne?
        // const containerHøydeClassName = ventegrunn
        //     ? 'h-[calc(100vh-110px)]' // 48px Header + 62px Alert
        //     : 'h-[calc(100vh-48px)]'; // 48px Header
        return (
            <>
                {ventegrunn && (
                    <FTAlertStripe variant="info">{venteBeskjed(ventegrunn)}</FTAlertStripe>
                )}
                {visVenteModal && ventegrunn && (
                    <PåVentModal
                        behandling={behandling.data}
                        ventegrunn={ventegrunn}
                        onClose={() => settVisVenteModal(false)}
                    />
                )}
                <div
                    className={classNames(
                        'grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 p-4 bg-gray-50 min-h-screen',
                        // containerHøydeClassName,
                        {
                            venter: !!ventegrunn,
                        }
                    )}
                >
                    <BehandlingContainer fagsak={fagsak.data} behandling={behandling.data} />
                </div>
            </>
        );
    } else {
        return (
            <DataLastIkkeSuksess
                ressurser={[behandling, fagsak]}
                behandlingId={behandlingId}
                eksternFagsakId={eksternFagsakId}
                visFeilSide
            />
        );
    }
};

export default FagsakContainer;
