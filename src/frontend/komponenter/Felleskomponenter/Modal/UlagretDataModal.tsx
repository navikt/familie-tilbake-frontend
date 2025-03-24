import type { FC } from 'react';
import type { BlockerFunction } from 'react-router';

import React, { useCallback, useEffect } from 'react';
import { useBeforeUnload, useBlocker } from 'react-router';

import { ModalWrapper } from './ModalWrapper';
import { useBehandling } from '../../../context/BehandlingContext';

const UlagretDataModal: FC = () => {
    const { nullstillIkkePersisterteKomponenter, harUlagredeData } = useBehandling();
    const skalBlokkere = useCallback<BlockerFunction>(
        ({ currentLocation, nextLocation }) =>
            harUlagredeData && currentLocation.pathname !== nextLocation.pathname,
        [harUlagredeData]
    );
    const blocker = useBlocker(skalBlokkere);

    useEffect(() => {
        if (blocker.state === 'blocked' && harUlagredeData === false) {
            blocker.reset();
        }
    }, [blocker, harUlagredeData]);

    const onAvbryt = () => blocker.state === 'blocked' && blocker.reset();
    const onForlatSiden = () => blocker.state === 'blocked' && blocker.proceed();

    /**
     * Denne trengs for å fange opp når noen refresher siden eller prøver å gå ut av selve siden.
     * Da kommer nettleserens innebygde prompt opp
     */
    useBeforeUnload(
        useCallback(
            event => {
                if (harUlagredeData) {
                    event.preventDefault();
                }
            },
            [harUlagredeData]
        ),
        { capture: true }
    );
    return (
        blocker.state === 'blocked' && (
            <ModalWrapper
                tittel="Du har ikke lagret dine siste endringer og vil miste disse om du forlater siden"
                visModal={true}
                onClose={onAvbryt}
                aksjonsknapper={{
                    hovedKnapp: {
                        onClick: onAvbryt,
                        tekst: 'Gå tilbake for å lagre',
                    },
                    lukkKnapp: {
                        onClick: () => {
                            onForlatSiden();
                            setTimeout(nullstillIkkePersisterteKomponenter, 10);
                        },
                        tekst: 'Forlat siden',
                    },
                    marginTop: 4,
                }}
            />
        )
    );
};

export default UlagretDataModal;
