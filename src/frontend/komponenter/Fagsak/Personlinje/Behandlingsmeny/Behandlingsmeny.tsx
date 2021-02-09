import * as React from 'react';

import { Menyknapp } from 'nav-frontend-ikonknapper';
import KnappBase from 'nav-frontend-knapper';
import Popover, { PopoverOrientering } from 'nav-frontend-popover';

import { RessursStatus } from '@navikt/familie-typer';

import { useBehandling } from '../../../../context/BehandlingContext';
import { IFagsak } from '../../../../typer/fagsak';

interface IProps {
    fagsak: IFagsak;
}

const Behandlingsmeny: React.FC<IProps> = () => {
    const { åpenBehandling } = useBehandling();
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
                <ul
                    className="behandlingsmeny__list"
                    role="menu"
                    style={{ minWidth: 190 }}
                    aria-labelledby={'behandlingsmeny-arialabel-knapp'}
                >
                    <li>
                        <KnappBase mini={true}>Opprett revurdering</KnappBase>
                    </li>
                    {åpenBehandling?.status === RessursStatus.SUKSESS && (
                        <>
                            <li>
                                <KnappBase mini={true}>Henlegg behandling</KnappBase>
                            </li>
                            <li>
                                <KnappBase mini={true}>Opprett/Fjern verge</KnappBase>
                            </li>
                            <li>
                                <KnappBase mini={true}>Bytt behandlingsenhet</KnappBase>
                            </li>
                        </>
                    )}
                </ul>
            </Popover>
        </>
    );
};

export default Behandlingsmeny;
