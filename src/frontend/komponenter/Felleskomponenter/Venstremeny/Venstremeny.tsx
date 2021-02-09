import * as React from 'react';

import classNames from 'classnames';

import { RessursStatus } from '@navikt/familie-typer';

import { useBehandling } from '../../../context/BehandlingContext';
import { IFagsak } from '../../../typer/fagsak';
import Link from './Link';
import { erSidenAktiv, sider, visSide } from './sider';

interface IProps {
    fagsak: IFagsak;
}

const Venstremeny: React.FunctionComponent<IProps> = ({ fagsak }) => {
    const { åpenBehandling } = useBehandling();

    return (
        <nav className={'venstremeny'}>
            {åpenBehandling?.status === RessursStatus.SUKSESS
                ? Object.entries(sider)
                      .filter(([_, side]) => visSide(side, åpenBehandling.data))
                      .map(([sideId, side], index: number) => {
                          const tilPath = `/ytelse/${fagsak.ytelseType}/fagsak/${fagsak.eksternFagsakId}/behandling/${åpenBehandling.data.eksternBrukId}/${side.href}`;
                          const aktiv = erSidenAktiv(side, åpenBehandling.data);
                          return (
                              <React.Fragment key={sideId}>
                                  <Link
                                      active={aktiv}
                                      id={sideId}
                                      to={tilPath}
                                      className={classNames(
                                          'venstremeny__link',
                                          aktiv && 'hover-effekt'
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
