import * as React from 'react';

import styled from 'styled-components';

import { ExternalLink } from '@navikt/ds-icons';
import { Link, Tag } from '@navikt/ds-react';
import {
    NavdsGlobalColorGray300,
    NavdsGlobalColorGray900,
    NavdsSemanticColorTextInverted,
    NavdsSpacing12,
    NavdsSpacing4,
    NavdsSpacing6,
} from '@navikt/ds-tokens/dist/tokens';
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
        padding: 0 ${NavdsSpacing4};
        border-bottom-color: ${NavdsGlobalColorGray300};

        &__lenke {
            margin-right: ${NavdsSpacing12};
        }
    }
`;

const DødsfallTag = styled(Tag)`
    color: ${NavdsSemanticColorTextInverted};
    background-color: ${NavdsGlobalColorGray900};
    border-color: ${NavdsGlobalColorGray900};
    margin-left: ${NavdsSpacing6};
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
                        Død: {formatterDatostring(bruker.dødsdato)}
                    </DødsfallTag>
                )}
                <PlaceholderDiv />

                {behandling?.status === RessursStatus.SUKSESS && (
                    <Link
                        className={'visittkort__lenke'}
                        href={lagLenkeTilRevurdering()}
                        target="_blank"
                    >
                        Gå til revurderingen
                        <ExternalLink aria-label="Gå til revurderingen" />
                    </Link>
                )}

                <Link className={'visittkort__lenke'} href={lagSaksoversiktUrl()} target="_blank">
                    Gå til saksoversikt
                    <ExternalLink aria-label="Gå til saksoversikt" />
                </Link>

                <Behandlingsmeny fagsak={fagsak} />
            </Visittkort>
        </StyledContainer>
    );
};

export default Personlinje;
