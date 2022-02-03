import * as React from 'react';

import styled from 'styled-components';

import navFarger from 'nav-frontend-core';
import Lenke from 'nav-frontend-lenker';

import { ExternalLink } from '@navikt/ds-icons';
import { RessursStatus } from '@navikt/familie-typer';
import { Visittkort } from '@navikt/familie-visittkort';

import { useBehandling } from '../../../context/BehandlingContext';
import { useFagsak } from '../../../context/FagsakContext';
import { IFagsak } from '../../../typer/fagsak';
import { IPerson } from '../../../typer/person';
import { hentAlder } from '../../../utils';
import Behandlingsmeny from './Behandlingsmeny/Behandlingsmeny';

const PlaceholderDiv = styled.div`
    flex: 1;
`;

const StyledContainer = styled.div`
    .visittkort {
        padding: 0 1rem;
        border-bottom-color: ${navFarger.navGra20} !important;

        &__lenke {
            margin-right: 3rem;
        }
    }
`;

interface IProps {
    bruker: IPerson;
    fagsak: IFagsak;
}

const Personlinje: React.FC<IProps> = ({ bruker, fagsak }) => {
    const { behandling, lagLenkeTilRevurdering } = useBehandling();
    const { lagSaksoversiktUrl } = useFagsak();
    return (
        <StyledContainer>
            <Visittkort
                navn={bruker.navn}
                ident={bruker.personIdent}
                kjønn={bruker.kjønn}
                alder={hentAlder(bruker.fødselsdato)}
            >
                <PlaceholderDiv />

                {behandling?.status === RessursStatus.SUKSESS && (
                    <Lenke
                        className={'visittkort__lenke'}
                        href={lagLenkeTilRevurdering()}
                        onMouseDown={e => e.preventDefault()}
                        target="_blank"
                    >
                        <span>Gå til revurderingen</span>
                        <ExternalLink aria-label="Gå til revurderingen" />
                    </Lenke>
                )}

                <Lenke
                    className={'visittkort__lenke'}
                    href={lagSaksoversiktUrl()}
                    onMouseDown={e => e.preventDefault()}
                    target="_blank"
                >
                    <span>Gå til saksoversikt</span>
                    <ExternalLink aria-label="Gå til saksoversikt" />
                </Lenke>

                <Behandlingsmeny fagsak={fagsak} />
            </Visittkort>
        </StyledContainer>
    );
};

export default Personlinje;
