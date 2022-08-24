import * as React from 'react';

import styled from 'styled-components';

import { ExternalLink, Office1Filled } from '@navikt/ds-icons';
import { Link, Tag } from '@navikt/ds-react';
import {
    NavdsGlobalColorGray900,
    NavdsSemanticColorBorderMuted,
    NavdsSemanticColorTextInverted,
    NavdsSpacing12,
    NavdsSpacing2,
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
        border-bottom-color: ${NavdsSemanticColorBorderMuted};

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

const InstitusjonsTag = styled(Tag)`
    margin-left: ${NavdsSpacing6};

    svg {
        margin-right: ${NavdsSpacing2};
    }
`;

const MaksLengdeInstitusjonNavn = styled.span`
    max-width: 10rem;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: clip;
    display: inline-block;
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
                    <DødsfallTag variant="info" size="small">
                        Død: {formatterDatostring(bruker.dødsdato)}
                    </DødsfallTag>
                )}
                {fagsak.institusjon && (
                    <InstitusjonsTag variant="info" size="small">
                        <Office1Filled />
                        <MaksLengdeInstitusjonNavn title={fagsak.institusjon.navn}>
                            {fagsak.institusjon.navn}
                        </MaksLengdeInstitusjonNavn>
                        <div className="visittkort__pipe">|</div>
                        {fagsak.institusjon.organisasjonsnummer}
                    </InstitusjonsTag>
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
