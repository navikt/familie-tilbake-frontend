import * as React from 'react';

import styled from 'styled-components';

import { HendelseType, hentHendelseTyper, Ytelsetype } from '../../../../kodeverk';
import { FaktaPeriode } from '../../../../typer/feilutbetalingtyper';
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

        &__label {
            display: none;
        }
    }
`;

interface IProps {
    ytelse: Ytelsetype;
    perioder: Array<FaktaPeriode>;
    erLesevisning: boolean;
}

const FeilutbetalingFaktaPerioder: React.FC<IProps> = ({ ytelse, perioder, erLesevisning }) => {
    const [hendelseTyper, settHendelseTyper] = React.useState<Array<HendelseType>>();

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
                {perioder.map((periode, index) => {
                    return (
                        <FeilutbetalingFaktaPeriode
                            hendelseTyper={hendelseTyper}
                            periode={periode}
                            key={`formIndex${index + 1}`}
                            index={index}
                            erLesevisning={erLesevisning}
                        />
                    );
                })}
            </tbody>
        </StyledPeriodeTable>
    );
};

export default FeilutbetalingFaktaPerioder;
