import type { FC } from 'react';
import type { BlockerFunction } from 'react-router';

import { useCallback, useEffect } from 'react';
import { useBeforeUnload, useBlocker, useLocation } from 'react-router';

import { useBehandlingState } from '@/context/BehandlingStateContext';

import { ModalWrapper } from './ModalWrapper';

export const UlagretDataModal: FC = () => {
    const { nullstillIkkePersisterteKomponenter, harUlagredeData } = useBehandlingState();
    const location = useLocation();
    const skalBlokkere = useCallback<BlockerFunction>(
        ({ currentLocation, nextLocation }) =>
            harUlagredeData &&
            (currentLocation.pathname !== nextLocation.pathname ||
                currentLocation.search !== nextLocation.search),
        [harUlagredeData]
    );
    const blocker = useBlocker(skalBlokkere);

    useEffect(() => {
        if (blocker.state === 'blocked' && harUlagredeData === false) {
            blocker.reset();
        }
    }, [blocker, harUlagredeData]);

    const onAvbryt = (): void => {
        blocker.state === 'blocked' && blocker.reset();
    };
    const onForlatSiden = (): void => {
        blocker.state === 'blocked' && blocker.proceed();
    };

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

    const erPeriodebytte =
        blocker.state === 'blocked' && blocker.location.pathname === location.pathname;

    return (
        blocker.state === 'blocked' && (
            <ModalWrapper
                tittel="Du har ulagrede endringer"
                visModal={true}
                onClose={onAvbryt}
                aksjonsknapper={{
                    hovedKnapp: {
                        onClick: onAvbryt,
                        tekst: 'Lukk',
                    },
                    lukkKnapp: {
                        onClick: () => {
                            onForlatSiden();
                            setTimeout(nullstillIkkePersisterteKomponenter, 10);
                        },
                        tekst: 'Fortsett uten å lagre',
                    },
                }}
            >
                {erPeriodebytte
                    ? 'Hvis du bytter periode nå, mister du endringene dine. Lukk dialogen og klikk på Lagre-knappen for å lagre endringene dine.'
                    : 'Hvis du forlater siden nå, mister du endringene dine. Lukk dialogen og klikk på Lagre-knappen for å lagre endringene dine.'}
            </ModalWrapper>
        )
    );
};
