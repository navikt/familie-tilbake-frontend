import * as React from 'react';

import classNames from 'classnames';
import styled from 'styled-components';

import {
    NavdsGlobalColorGray300,
    NavdsSemanticColorCanvasBackground,
    NavdsSemanticColorFocus,
    NavdsSemanticColorText,
    NavdsSpacing12,
    NavdsSpacing2,
    NavdsSpacing8,
} from '@navikt/ds-tokens/dist/tokens';
import { RessursStatus } from '@navikt/familie-typer';

import { useBehandling } from '../../../context/BehandlingContext';
import { IFagsak } from '../../../typer/fagsak';
import Link from './Link';
import { erSidenAktiv, sider, visSide } from './sider';

const StyledNav = styled.nav`
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: ${NavdsSpacing8} 0;
`;

const StyledLink = styled(Link)`
    text-decoration: none;
    padding: ${NavdsSpacing2} ${NavdsSpacing12} ${NavdsSpacing2} ${NavdsSpacing8};
    color: ${NavdsSemanticColorText};

    &.hover-effekt:hover {
        background: ${NavdsSemanticColorCanvasBackground};
    }

    &.active {
        background: ${NavdsSemanticColorCanvasBackground};
    }

    &.active {
        box-shadow: inset 0.35rem 0 0 0 ${NavdsSemanticColorFocus};
    }

    &:focus {
        box-shadow: inset 0.35rem 0 0 0 ${NavdsSemanticColorFocus};
        outline: none;
    }

    &:focus {
        z-index: 1000;
    }

    &.inactive {
        color: ${NavdsGlobalColorGray300};

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
