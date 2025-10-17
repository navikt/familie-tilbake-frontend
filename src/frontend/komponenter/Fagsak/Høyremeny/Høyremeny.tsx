import type { Behandling } from '../../../typer/behandling';
import type { Fagsak } from '../../../typer/fagsak';

import { Modal } from '@navikt/ds-react';
import classNames from 'classnames';
import * as React from 'react';

import { HistorikkOgDokumenter } from './HistorikkOgDokumenter';
import { BrukerInformasjon } from './Informasjonsbokser/BrukerInformasjon';
import { Faktaboks } from './Informasjonsbokser/Faktaboks';
import { useBehandling } from '../../../context/BehandlingContext';

type Props = {
    fagsak: Fagsak;
    behandling: Behandling;
    ref: React.RefObject<HTMLDialogElement | null>;
};

const Høyremeny: React.FC<Props> = ({ fagsak, behandling, ref }) => {
    const { harVærtPåFatteVedtakSteget, ventegrunn } = useBehandling();
    const værtPåFatteVedtakSteget = harVærtPåFatteVedtakSteget();

    const handleKlikkUtenforModal: React.MouseEventHandler<HTMLDialogElement> = e => {
        if (e.target === e.currentTarget) {
            (e.currentTarget as HTMLDialogElement).close();
        }
    };

    return (
        <>
            {/* Reduserer høyden med header(48)-høyde og padding(16+16)-høyde til fagsakcontainer */}
            <aside
                aria-label="Informasjon om tilbakekrevingen og bruker"
                className={classNames(
                    'flex-col gap-4 bg-gray-50 hidden lg:flex max-h-[calc(100vh-80px)]',
                    { 'max-h-[calc(100vh-142px)]': !!ventegrunn }
                )}
            >
                <div className="gap-4 flex flex-col flex-1 min-h-0">
                    <Faktaboks behandling={behandling} ytelsestype={fagsak.ytelsestype} />
                    <BrukerInformasjon bruker={fagsak.bruker} institusjon={fagsak.institusjon} />
                    <HistorikkOgDokumenter
                        værtPåFatteVedtakSteget={værtPåFatteVedtakSteget}
                        fagsak={fagsak}
                        behandling={behandling}
                    />
                </div>
            </aside>

            <Modal
                ref={ref}
                aria-label="Informasjon om tilbakekrevingen og bruker"
                className="h-full mr-2 my-2 lg:hidden"
                onClick={handleKlikkUtenforModal}
            >
                <Modal.Header />
                <Modal.Body className="flex flex-col gap-4">
                    <Faktaboks behandling={behandling} ytelsestype={fagsak.ytelsestype} />
                    <BrukerInformasjon bruker={fagsak.bruker} institusjon={fagsak.institusjon} />
                    <HistorikkOgDokumenter
                        værtPåFatteVedtakSteget={værtPåFatteVedtakSteget}
                        fagsak={fagsak}
                        behandling={behandling}
                    />
                </Modal.Body>
            </Modal>
        </>
    );
};

export default Høyremeny;
