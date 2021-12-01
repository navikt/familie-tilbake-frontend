import * as React from 'react';

import styled from 'styled-components';

import { HendelseType, hentHendelseTyper, Ytelsetype } from '../../../../kodeverk';
import { FaktaPeriodeSkjemaData } from '../typer/feilutbetalingFakta';
import FeilutbetalingFaktaPeriode from './FeilutbetalingFaktaPeriodeSkjema';

const StyledPeriodeTable = styled.table`
    width: 100%;

    th {
        border-bottom: 1px solid black;
        text-align: left;
    }

    td {
        vertical-align: top;
    }

    th,
    td {
        padding: 5px;

        :last-child {
            text-align: right;
        }
    }

    tbody tr:last-child td {
        border-bottom: 1px solid black;
    }

    .skjemaelement {
        margin: 5px;
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
        <StyledPeriodeTable cellSpacing={0} cellPadding={0}>
            <thead>
                <tr>
                    <th>Periode</th>
                    <th>Hendelse</th>
                    <th>Feilutbetalt beløp</th>
                </tr>
            </thead>
            <tbody>
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
            </tbody>
        </StyledPeriodeTable>
    );
};

export default FeilutbetalingFaktaPerioder;
