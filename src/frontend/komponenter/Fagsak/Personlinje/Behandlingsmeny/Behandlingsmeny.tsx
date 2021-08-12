import * as React from 'react';

import styled from 'styled-components';

import navFarger from 'nav-frontend-core';
import { Menyknapp } from 'nav-frontend-ikonknapper';
import KnappBase from 'nav-frontend-knapper';
import Popover, { PopoverOrientering } from 'nav-frontend-popover';

import { RessursStatus } from '@navikt/familie-typer';

import { useBehandling } from '../../../../context/BehandlingContext';
import { Fagsystem } from '../../../../kodeverk';
import { Behandlingssteg, Behandlingstatus } from '../../../../typer/behandling';
import { IFagsak } from '../../../../typer/fagsak';
import EndreBehandlendeEnhet from './EndreBehandlendeEnhet/EndreBehandlendeEnhet';
import GjennoptaBehandling from './GjennoptaBehandling/GjennoptaBehandling';
import HenleggBehandling from './HenleggBehandling/HenleggBehandling';
import SettBehandlingPåVent from './SettBehandlingPåVent/SettBehandlingPåVent';

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

const Behandlingsmeny: React.FC<IProps> = ({ fagsak }) => {
    const { behandling, ventegrunn, erStegBehandlet, aktivtSteg } = useBehandling();
    const [anker, settAnker] = React.useState<HTMLElement | undefined>(undefined);

    const venterPåKravgrunnlag = ventegrunn?.behandlingssteg === Behandlingssteg.GRUNNLAG;
    const vedtakFattetEllerFattes =
        erStegBehandlet(Behandlingssteg.FATTE_VEDTAK) ||
        aktivtSteg?.behandlingssteg === Behandlingssteg.FATTE_VEDTAK;

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
                    {behandling?.status === RessursStatus.SUKSESS &&
                        behandling.data.status !== Behandlingstatus.AVSLUTTET &&
                        !vedtakFattetEllerFattes && (
                            <>
                                <li>
                                    <HenleggBehandling behandling={behandling.data} />
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
                                {!venterPåKravgrunnlag ? (
                                    behandling.data.erBehandlingPåVent || ventegrunn ? (
                                        <GjennoptaBehandling behandling={behandling.data} />
                                    ) : (
                                        <SettBehandlingPåVent behandling={behandling.data} />
                                    )
                                ) : null}
                                {fagsak.fagsystem === Fagsystem.BA && (
                                    <li>
                                        <EndreBehandlendeEnhet
                                            ytelse={fagsak.ytelsestype}
                                            behandling={behandling.data}
                                            onListElementClick={() => settAnker(undefined)}
                                        />
                                    </li>
                                )}
                            </>
                        )}
                </StyledList>
            </Popover>
        </>
    );
};

export default Behandlingsmeny;
