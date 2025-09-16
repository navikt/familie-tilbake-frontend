import type { HendelseType, Ytelsetype } from '../../../../kodeverk';
import type { FaktaPeriodeSkjemaData } from '../typer/feilutbetalingFakta';

import { Table } from '@navikt/ds-react';
import * as React from 'react';
import { styled } from 'styled-components';

import { FaktaPeriodeSkjema } from './FaktaPeriodeSkjema';
import { hentHendelseTyper } from '../../../../kodeverk';
import { useFeilutbetalingFakta } from '../FeilutbetalingFaktaContext';

const StyledPeriodeTable = styled(Table)`
    td {
        vertical-align: top;

        &:nth-of-type(2) {
            padding-top: 0px;
        }
    }
`;

interface IProps {
    ytelse: Ytelsetype;
    perioder: FaktaPeriodeSkjemaData[];
    erLesevisning: boolean;
}

const FeilutbetalingFaktaPerioder: React.FC<IProps> = ({ ytelse, perioder, erLesevisning }) => {
    const [hendelseTyper, settHendelseTyper] = React.useState<HendelseType[]>();
    const { fagsak } = useFeilutbetalingFakta();

    React.useEffect(() => {
        settHendelseTyper(hentHendelseTyper(ytelse, !!fagsak.institusjon));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ytelse]);

    return (
        <StyledPeriodeTable size="small">
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell scope="col">Periode</Table.HeaderCell>
                    <Table.HeaderCell scope="col">Hendelse</Table.HeaderCell>
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

export default FeilutbetalingFaktaPerioder;
