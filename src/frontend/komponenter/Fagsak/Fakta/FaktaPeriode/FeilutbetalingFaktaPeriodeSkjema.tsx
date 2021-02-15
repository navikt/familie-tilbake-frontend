import * as React from 'react';

import classNames from 'classnames';

import { Undertekst } from 'nav-frontend-typografi';

import { FamilieSelect } from '@navikt/familie-form-elements';

import {
    hendelseType,
    HendelseType,
    hendelseUndertype,
    HendelseUndertype,
    hentHendelseUndertyper,
} from '../../../../kodeverk';
import { FaktaPeriode } from '../../../../typer/feilutbetalingtyper';
import { formatterDatostring } from '../../../../utils/dateUtils';

interface IProps {
    periode: FaktaPeriode;
    hendelseTyper: Array<HendelseType> | undefined;
    index: number;
}

const FeilutbetalingFaktaPeriode: React.FC<IProps> = ({ periode, hendelseTyper, index }) => {
    const [hendelseUnderTyper, settHendelseUnderTyper] = React.useState<Array<HendelseUndertype>>();
    const [valgtÅrsak, settValgtÅrsak] = React.useState<HendelseType>();
    const [valgtUnderÅrsak, settValgtUnderÅrsak] = React.useState<HendelseUndertype>();

    React.useEffect(() => {
        if (periode.feilutbetalingÅrsakDto) {
            settHendelseUnderTyper(
                hentHendelseUndertyper(periode.feilutbetalingÅrsakDto.hendelseType)
            );
            settValgtÅrsak(periode.feilutbetalingÅrsakDto.hendelseType);
            settValgtUnderÅrsak(periode.feilutbetalingÅrsakDto.hendelseUndertype);
        }
    }, [periode]);

    const onChangeÅrsak = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const årsak = HendelseType[e.target.value as keyof typeof HendelseType];
        settValgtÅrsak(årsak);
        settHendelseUnderTyper(hentHendelseUndertyper(årsak));
    };

    const onChangeUnderÅrsak = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const underÅrsak = HendelseUndertype[e.target.value as keyof typeof HendelseUndertype];
        settValgtUnderÅrsak(underÅrsak);
    };

    return (
        <tr>
            <td>
                <Undertekst>{`${formatterDatostring(periode.fom)} - ${formatterDatostring(
                    periode.tom
                )}`}</Undertekst>
            </td>
            <td>
                <FamilieSelect
                    id={`perioder.${index}.årsak`}
                    label={'Årsak'}
                    onChange={event => onChangeÅrsak(event)}
                    value={valgtÅrsak ? valgtÅrsak : '-'}
                >
                    <option>-</option>
                    {hendelseTyper?.map(type => (
                        <option key={type} value={type}>
                            {hendelseType[type]}
                        </option>
                    ))}
                </FamilieSelect>
                {hendelseUnderTyper && (
                    <FamilieSelect
                        id={`perioder.${index}.underårsak`}
                        label={'Underårsak'}
                        onChange={event => onChangeUnderÅrsak(event)}
                        value={valgtUnderÅrsak ? valgtUnderÅrsak : '-'}
                    >
                        <option>-</option>
                        {hendelseUnderTyper.map(type => (
                            <option key={type} value={type}>
                                {hendelseUndertype[type]}
                            </option>
                        ))}
                    </FamilieSelect>
                )}
            </td>
            <td className={classNames('beløp', 'redText')}>
                <Undertekst>{periode.belop}</Undertekst>
            </td>
        </tr>
    );
};

export default FeilutbetalingFaktaPeriode;
