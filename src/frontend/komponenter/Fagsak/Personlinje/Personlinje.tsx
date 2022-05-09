import * as React from 'react';

import styled from 'styled-components';

import { ExternalLink } from '@navikt/ds-icons';
import { Link, Tag } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';
import { Visittkort } from '@navikt/familie-visittkort';

import { useBehandling } from '../../../context/BehandlingContext';
import { useFagsak } from '../../../context/FagsakContext';
import { IFagsak } from '../../../typer/fagsak';
import { IPerson } from '../../../typer/person';
import { formatterDatostring, hentAlder } from '../../../utils';
import Behandlingsmeny from './Behandlingsmeny/Behandlingsmeny';

const PlaceholderDiv = styled.div`
    flex: 1;
`;

const StyledContainer = styled.div`
    .visittkort {
        padding: 0 1rem;
        border-bottom-color: var(--navds-global-color-gray-300);

        &__lenke {
            margin-right: 3rem;
        }
    }
`;

const DødsfallTag = styled(Tag)`
    color: var(--navds-global-color-white);
    background-color: var(--navds-global-color-gray-900);
    border-color: var(--navds-global-color-gray-900);
    margin-left: 1.5rem;
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
                {bruker.dødsdato && (
                    <DødsfallTag variant="info">
                        Død {formatterDatostring(bruker.dødsdato)}
                    </DødsfallTag>
                )}
                <PlaceholderDiv />

                {behandling?.status === RessursStatus.SUKSESS && (
                    <Link
                        className={'visittkort__lenke'}
                        href={lagLenkeTilRevurdering()}
                        target="_blank"
                    >
                        <span>Gå til revurderingen</span>
                        <ExternalLink />
                    </Link>
                )}

                <Link className={'visittkort__lenke'} href={lagSaksoversiktUrl()} target="_blank">
                    <span>Gå til saksoversikt</span>
                    <ExternalLink />
                </Link>

                <Behandlingsmeny fagsak={fagsak} />
            </Visittkort>
        </StyledContainer>
    );
};

export default Personlinje;
