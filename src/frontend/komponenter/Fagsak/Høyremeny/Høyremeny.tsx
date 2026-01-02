import type { Behandling } from '../../../typer/behandling';

import { Modal } from '@navikt/ds-react';
import classNames from 'classnames';
import * as React from 'react';
import { useEffect } from 'react';

import { HistorikkOgDokumenter } from './HistorikkOgDokumenter';
import { BrukerInformasjon } from './Informasjonsbokser/BrukerInformasjon';
import { Faktaboks } from './Informasjonsbokser/Faktaboks';
import { useBehandling } from '../../../context/BehandlingContext';

type Props = {
    behandling: Behandling;
    dialogRef: React.RefObject<HTMLDialogElement | null>;
};

const Høyremeny: React.FC<Props> = ({ behandling, dialogRef }) => {
    const { harVærtPåFatteVedtakSteget, ventegrunn } = useBehandling();
    const værtPåFatteVedtakSteget = harVærtPåFatteVedtakSteget();

    useEffect(() => {
        const mq = window.matchMedia('(min-width: 1024px)');
        const lukkModalenHvisStørreEnnLg = (): void => {
            if (mq.matches && dialogRef.current?.open) {
                dialogRef.current.close();
            }
        };
        lukkModalenHvisStørreEnnLg();
        mq.addEventListener('change', lukkModalenHvisStørreEnnLg);
        return (): void => mq.removeEventListener('change', lukkModalenHvisStørreEnnLg);
    }, [dialogRef]);

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
                className={classNames('flex-col gap-4 hidden ax-lg:flex max-h-[calc(100vh-80px)]', {
                    'max-h-[calc(100vh-142px)]': !!ventegrunn,
                })}
            >
                <div className="gap-4 flex flex-col flex-1 min-h-0">
                    <Faktaboks behandling={behandling} />
                    <BrukerInformasjon />
                    <HistorikkOgDokumenter
                        værtPåFatteVedtakSteget={værtPåFatteVedtakSteget}
                        behandling={behandling}
                    />
                </div>
            </aside>

            <Modal
                ref={dialogRef}
                aria-label="Informasjon om tilbakekrevingen og bruker"
                className="h-full mr-2 my-2"
                onClick={handleKlikkUtenforModal}
            >
                <Modal.Header />
                <Modal.Body className="flex flex-col gap-4">
                    <Faktaboks behandling={behandling} />
                    <BrukerInformasjon />
                    <HistorikkOgDokumenter
                        værtPåFatteVedtakSteget={værtPåFatteVedtakSteget}
                        behandling={behandling}
                    />
                </Modal.Body>
            </Modal>
        </>
    );
};

export default Høyremeny;
