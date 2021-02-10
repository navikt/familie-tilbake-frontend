import * as React from 'react';

import { HendelseType } from '../../../../kodeverk/feilutbetalingsÅrsak';
import { hentHendelseTyper, Ytelsetype } from '../../../../kodeverk/ytelsetype';
import { IFaktaPeriode } from '../../../../typer/feilutbetalingFakta';
import FeilutbetalingPeriode from './FeilutbetalingPeriode';

interface IProps {
    ytelse: Ytelsetype;
    perioder: Array<IFaktaPeriode>;
}

const FeilutbetalingPerioder: React.FC<IProps> = ({ ytelse, perioder }) => {
    const [hendelseTyper, settHendelseTyper] = React.useState<Array<HendelseType>>();

    React.useEffect(() => {
        settHendelseTyper(hentHendelseTyper(ytelse));
    }, [ytelse]);

    return (
        <table cellSpacing={0} cellPadding={0}>
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
                        <FeilutbetalingPeriode
                            hendelseTyper={hendelseTyper}
                            periode={periode}
                            key={`formIndex${index + 1}`}
                            index={index}
                        />
                    );
                })}
            </tbody>
        </table>
    );
};

export default FeilutbetalingPerioder;
