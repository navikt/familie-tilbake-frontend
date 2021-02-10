import * as React from 'react';

import classNames from 'classnames';
import styled from 'styled-components';

import navFarger from 'nav-frontend-core';

import { RessursStatus } from '@navikt/familie-typer';

import { useBehandling } from '../../../context/BehandlingContext';
import { IFagsak } from '../../../typer/fagsak';
import Link from './Link';
import { erSidenAktiv, sider, visSide } from './sider';

const StyledNav = styled.nav`
    display: flex;
    flex: 1;
    flex-direction: column;
    background: white;
    padding: 2rem 0;
`;

const StyledLink = styled(Link)`
    text-decoration: none;
    padding: 0.5rem 3rem 0.5rem 2rem;
    color: ${navFarger.navGra80};

    &.hover-effekt:hover {
        background: ${navFarger.navLysGra};
    }

    &.active {
        background: ${navFarger.navLysGra};
    }

    &.active {
        box-shadow: inset 0.35rem 0 0 0 ${navFarger.navBla};
    }

    &:focus {
        box-shadow: 0 0 0 3px ${navFarger.fokusFarge};
        outline: none;
    }

    &:focus {
        z-index: 1000;
    }

    &.inactive {
        color: ${navFarger.navLysGra};
    }
`;

interface IProps {
    fagsak: IFagsak;
}

const Venstremeny: React.FunctionComponent<IProps> = ({ fagsak }) => {
    const { åpenBehandling } = useBehandling();

    return (
        <StyledNav>
            {åpenBehandling?.status === RessursStatus.SUKSESS
                ? Object.entries(sider)
                      .filter(([_, side]) => visSide(side, åpenBehandling.data))
                      .map(([sideId, side], index: number) => {
                          const tilPath = `/ytelse/${fagsak.ytelseType}/fagsak/${fagsak.eksternFagsakId}/behandling/${åpenBehandling.data.eksternBrukId}/${side.href}`;
                          const aktiv = erSidenAktiv(side, åpenBehandling.data);
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
