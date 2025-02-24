import type { IFagsak } from '../../../typer/fagsak';

import {
    AGray300,
    ABgSubtle,
    ABorderFocus,
    ATextDefault,
    ASpacing12,
    ASpacing2,
    ASpacing8,
} from '@navikt/ds-tokens/dist/tokens';
import classNames from 'classnames';
import * as React from 'react';
import { styled } from 'styled-components';

import Link from './Link';
import { erSidenAktiv, sider, visSide } from './sider';
import { useBehandling } from '../../../context/BehandlingContext';
import { RessursStatus } from '../../../typer/ressurs';

const StyledNav = styled.nav`
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: ${ASpacing8} 0;
`;

const StyledLink = styled(Link)`
    text-decoration: none;
    padding: ${ASpacing2} ${ASpacing12} ${ASpacing2} ${ASpacing8};
    color: ${ATextDefault};

    &.hover-effekt:hover {
        background: ${ABgSubtle};
    }

    &.active {
        background: ${ABgSubtle};
    }

    &.active {
        box-shadow: inset 0.35rem 0 0 0 ${ABorderFocus};
    }

    &:focus {
        box-shadow: inset 0.35rem 0 0 0 ${ABorderFocus};
        outline: none;
    }

    &:focus {
        z-index: 1000;
    }

    &.inactive {
        color: ${AGray300};

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
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
