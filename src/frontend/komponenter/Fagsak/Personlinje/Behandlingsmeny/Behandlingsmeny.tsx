import * as React from 'react';

import styled from 'styled-components';

import navFarger from 'nav-frontend-core';
import { Menyknapp } from 'nav-frontend-ikonknapper';
import KnappBase from 'nav-frontend-knapper';
import Popover, { PopoverOrientering } from 'nav-frontend-popover';

import { RessursStatus } from '@navikt/familie-typer';

import { useBehandling } from '../../../../context/BehandlingContext';
import { IFagsak } from '../../../../typer/fagsak';

const StyledList = styled.ul`
    list-style-type: none;
    padding: 0;
    text-align: left;
    min-width: 190px;

    .knapp {
        border: none;
        margin: 0.1rem 0;
        width: 100%;
        display: flex;
        justify-content: left;

        &--disabled {
            color: ${navFarger.navLysBla};
            background-color: ${navFarger.navLysBlaLighten80};
        }
    }
`;

interface IProps {
    fagsak: IFagsak;
}

const Behandlingsmeny: React.FC<IProps> = () => {
    const { behandling } = useBehandling();
    const [anker, settAnker] = React.useState<HTMLElement | undefined>(undefined);

    return (
        <>
            <Menyknapp
                id={'behandlingsmeny-arialabel-knapp'}
                mini={true}
                onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
                    settAnker(anker === undefined ? event.currentTarget : undefined)
                }
            >
                Behandlingsmeny
            </Menyknapp>

            <Popover
                id={'behandlingsmeny-arialabel-popover'}
                ankerEl={anker}
                orientering={PopoverOrientering.Under}
                autoFokus={false}
                onRequestClose={() => {
                    settAnker(undefined);
                }}
                tabIndex={-1}
                utenPil
            >
                <StyledList role="menu" aria-labelledby={'behandlingsmeny-arialabel-knapp'}>
                    <li>
                        <KnappBase mini={true}>Opprett revurdering</KnappBase>
                    </li>
                    {behandling?.status === RessursStatus.SUKSESS && (
                        <>
                            <li>
                                <KnappBase
                                    mini={true}
                                    disabled={!behandling.data.kanHenleggeBehandling}
                                >
                                    Henlegg behandling
                                </KnappBase>
                            </li>
                            {behandling.data.harVerge ? (
                                <li>
                                    <KnappBase mini={true}>Fjern verge</KnappBase>
                                </li>
                            ) : (
                                <li>
                                    <KnappBase mini={true}>Opprett verge</KnappBase>
                                </li>
                            )}
                            <li>
                                <KnappBase mini={true}>Bytt behandlingsenhet</KnappBase>
                            </li>
                            {behandling.data.erBehandlingPåVent ? (
                                <KnappBase mini={true}>Fortsett behandling</KnappBase>
                            ) : (
                                <KnappBase mini={true}>Sett behandling på vent</KnappBase>
                            )}
                        </>
                    )}
                </StyledList>
            </Popover>
        </>
    );
};

export default Behandlingsmeny;
