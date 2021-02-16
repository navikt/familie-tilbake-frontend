import * as React from 'react';

import styled from 'styled-components';

import { HendelseType, hentHendelseTyper, Ytelsetype } from '../../../../kodeverk';
import { FaktaPeriode } from '../../../../typer/feilutbetalingtyper';
import FeilutbetalingFaktaPeriode from './FeilutbetalingFaktaPeriodeSkjema';

const StyledPeriodeTable = styled.table`
    width: 100%;

    td {
        margin-left: 0px;
        margin-right: 0px;
        vertical-align: top;
        padding: 5px;
    }

    th {
        border-bottom: 1px solid black;
        text-align: left;
        padding: 5px;
    }

    .beløp {
        text-align: right;
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
}

const FeilutbetalingFaktaPerioder: React.FC<IProps> = ({ ytelse, perioder }) => {
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
                    <th className={'beløp'}>Feilutbetalt beløp</th>
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
                        />
                    );
                })}
            </tbody>
        </StyledPeriodeTable>
    );
};

export default FeilutbetalingFaktaPerioder;
