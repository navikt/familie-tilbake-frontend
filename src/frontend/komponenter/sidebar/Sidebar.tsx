import { Modal } from '@navikt/ds-react';
import classNames from 'classnames';
import * as React from 'react';
import { useEffect } from 'react';

import { useBehandlingState } from '~/context/BehandlingStateContext';

import { HistorikkOgDokumenter } from './HistorikkOgDokumenter';
import { BrukerInformasjon } from './informasjonsbokser/BrukerInformasjon';
import { Faktaboks } from './informasjonsbokser/Faktaboks';

type Props = {
    dialogRef: React.RefObject<HTMLDialogElement | null>;
};

export const Sidebar: React.FC<Props> = ({ dialogRef }) => {
    const { harVærtPåFatteVedtakSteget, ventegrunn } = useBehandlingState();
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
                    <Faktaboks />
                    <BrukerInformasjon />
                    <HistorikkOgDokumenter værtPåFatteVedtakSteget={værtPåFatteVedtakSteget} />
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
                    <Faktaboks />
                    <BrukerInformasjon />
                    <HistorikkOgDokumenter værtPåFatteVedtakSteget={værtPåFatteVedtakSteget} />
                </Modal.Body>
            </Modal>
        </>
    );
};
