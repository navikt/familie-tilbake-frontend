import type { HendelseType } from '../../../../kodeverk';
import type { FaktaPeriodeSkjemaData } from '../typer/fakta';

import { Table } from '@navikt/ds-react';
import * as React from 'react';
import { styled } from 'styled-components';

import { FaktaPeriodeSkjema } from './FaktaPeriodeSkjema';
import { useFagsak } from '../../../../context/FagsakContext';
import { hentHendelseTyper } from '../../../../kodeverk';

const StyledPeriodeTable = styled(Table)`
    td {
        vertical-align: top;

        &:nth-of-type(2) {
            padding-top: 0px;
        }
    }
`;

type Props = {
    perioder: FaktaPeriodeSkjemaData[];
    erLesevisning: boolean;
};

const FaktaPerioder: React.FC<Props> = ({ perioder, erLesevisning }) => {
    const [hendelseTyper, settHendelseTyper] = React.useState<HendelseType[]>();
    const { fagsak } = useFagsak();

    React.useEffect(() => {
        if (fagsak?.ytelsestype) {
            settHendelseTyper(hentHendelseTyper(fagsak.ytelsestype, !!fagsak.institusjon));
        }
    }, [fagsak?.ytelsestype, fagsak?.institusjon]);

    return (
        <StyledPeriodeTable size="small">
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell scope="col">Periode</Table.HeaderCell>
                    <Table.HeaderCell scope="col">Rettslig grunnlag</Table.HeaderCell>
                    <Table.HeaderCell scope="col" align="right">
                        Feilutbetalt beløp
                    </Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {perioder.map(periode => {
                    return (
                        <FaktaPeriodeSkjema
                            hendelseTyper={hendelseTyper}
                            periode={periode}
                            key={`formIndex${periode.index + 1}`}
                            index={periode.index}
                            erLesevisning={erLesevisning}
                        />
                    );
                })}
            </Table.Body>
        </StyledPeriodeTable>
    );
};

export default FaktaPerioder;
