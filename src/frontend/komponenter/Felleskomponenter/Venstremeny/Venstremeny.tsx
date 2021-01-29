import * as React from 'react';

import classNames from 'classnames';

import { useBehandling } from '../../../context/BehandlingContext';
import { IFagsak } from '../../../typer/fagsak';
import Link from './Link';
import { erSidenAktiv, sider } from './sider';

interface IProps {
    fagsak: IFagsak;
}

const Venstremeny: React.FunctionComponent<IProps> = ({ fagsak }) => {
    const { åpenBehandling } = useBehandling();

    return (
        <nav className={'venstremeny'}>
            {åpenBehandling
                ? Object.entries(sider).map(([sideId, side], index: number) => {
                      const tilPath = `/fagsak/${fagsak.id}/behandling/${åpenBehandling.behandlingId}/${side.href}`;

                      return (
                          <React.Fragment key={sideId}>
                              <Link
                                  active={erSidenAktiv(side, åpenBehandling)}
                                  id={sideId}
                                  to={tilPath}
                                  className={classNames(
                                      'venstremeny__link',
                                      erSidenAktiv(side, åpenBehandling) && 'hover-effekt'
                                  )}
                              >
                                  {`${index + 1}. ${side.navn}`}
                              </Link>
                          </React.Fragment>
                      );
                  })
                : null}
        </nav>
    );
};

export default Venstremeny;
