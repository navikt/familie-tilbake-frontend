import * as React from 'react';

import styled from 'styled-components';

import { Table } from '@navikt/ds-react';

import { HendelseType, hentHendelseTyper, Ytelsetype } from '../../../../kodeverk';
import { FaktaPeriodeSkjemaData } from '../typer/feilutbetalingFakta';
import FeilutbetalingFaktaPeriode from './FeilutbetalingFaktaPeriodeSkjema';

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

    React.useEffect(() => {
        settHendelseTyper(hentHendelseTyper(ytelse));
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
                        <FeilutbetalingFaktaPeriode
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
