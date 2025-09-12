import type { IFagsak } from '../../../typer/fagsak';
import type { IPerson } from '../../../typer/person';

import { Buildings3Icon, LeaveIcon } from '@navikt/aksel-icons';
import { HStack, Link, Tag } from '@navikt/ds-react';
import { AGray900, ATextOnInverted, ASpacing2, ASpacing6 } from '@navikt/ds-tokens/dist/tokens';
import * as React from 'react';
import { useLocation } from 'react-router';
import { styled } from 'styled-components';

import Behandlingsmeny from './Behandlingsmeny/Behandlingsmeny';
import Visittkort from './Visittkort';
import { formatterDatostring, hentAlder } from '../../../utils';
import { erHistoriskSide } from '../../../utils/sider';

const DødsfallTag = styled(Tag)`
    color: ${ATextOnInverted};
    background-color: ${AGray900};
    border-color: ${AGray900};
    margin-left: ${ASpacing6};
`;

const InstitusjonsTag = styled(Tag)`
    margin-left: ${ASpacing6};

    svg {
        margin-right: ${ASpacing2};
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
    const location = useLocation();
    const behandlingsPath = location.pathname.split('/').at(-1);
    const erHistoriskVisning = behandlingsPath && erHistoriskSide(behandlingsPath);

    return (
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
                    <Buildings3Icon fontSize="1.25rem" />
                    <MaksLengdeInstitusjonNavn title={fagsak.institusjon.navn}>
                        {fagsak.institusjon.navn}
                    </MaksLengdeInstitusjonNavn>
                    <div>|</div>
                    {fagsak.institusjon.organisasjonsnummer}
                </InstitusjonsTag>
            )}
            <HStack gap="4">
                {erHistoriskVisning && (
                    <Link href={`${location.pathname.replace(behandlingsPath, '')}`}>
                        Gå til behandling
                        <LeaveIcon title="Tilbake til behandlingen" fontSize="1.375rem" />
                    </Link>
                )}
            </HStack>

            <Behandlingsmeny fagsak={fagsak} />
        </Visittkort>
    );
};

export default Personlinje;
