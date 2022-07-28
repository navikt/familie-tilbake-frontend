import * as React from 'react';

import classNames from 'classnames';
import styled from 'styled-components';

import { RessursStatus } from '@navikt/familie-typer';

import { useBehandling } from '../../../context/BehandlingContext';
import { IFagsak } from '../../../typer/fagsak';
import Link from './Link';
import { erSidenAktiv, sider, visSide } from './sider';

const StyledNav = styled.nav`
    display: flex;
    flex: 1;
    flex-direction: column;
    background: var(--navds-semantic-color-canvas-background-light);
    padding: 2rem 0;
`;

const StyledLink = styled(Link)`
    text-decoration: none;
    padding: 0.5rem 3rem 0.5rem 2rem;
    color: var(--navds-semantic-color-text);

    &.hover-effekt:hover {
        background: var(--navds-semantic-color-canvas-background);
    }

    &.active {
        background: var(--navds-semantic-color-canvas-background);
    }

    &.active {
        box-shadow: inset 0.35rem 0 0 0 var(--navds-semantic-color-focus);
    }

    &:focus {
        box-shadow: inset 0.35rem 0 0 0 var(--navds-semantic-color-focus);
        outline: none;
    }

    &:focus {
        z-index: 1000;
    }

    &.inactive {
        color: var(--navds-global-color-gray-300);

        &:hover {
            cursor: not-allowed;
        }
    }
`;

interface IProps {
    fagsak: IFagsak;
}

const Venstremeny: React.FunctionComponent<IProps> = ({ fagsak }) => {
    const { behandling } = useBehandling();

    return (
        <StyledNav>
            {behandling?.status === RessursStatus.SUKSESS
                ? Object.entries(sider)
                      .filter(([_, side]) => visSide(side, behandling.data))
                      .map(([sideId, side], index: number) => {
                          const tilPath = `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.data.eksternBrukId}/${side.href}`;
                          const aktiv = erSidenAktiv(side, behandling.data);
                          return (
                              <React.Fragment key={sideId}>
                                  <StyledLink
                                      active={aktiv}
                                      id={sideId}
                                      to={tilPath}
                                      className={classNames(aktiv && 'hover-effekt')}
                                  >
                                      {`${index + 1}. ${side.navn}`}
                                  </StyledLink>
                              </React.Fragment>
                          );
                      })
                : null}
        </StyledNav>
    );
};

export default Venstremeny;
