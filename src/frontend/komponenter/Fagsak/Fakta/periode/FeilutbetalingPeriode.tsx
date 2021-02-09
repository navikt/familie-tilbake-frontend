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
} from '../../../../kodeverk/feilutbetalingsÅrsak';
import { IFaktaPeriode } from '../../../../typer/feilutbetalingFakta';

interface IProps {
    periode: IFaktaPeriode;
    hendelseTyper: Array<HendelseType> | undefined;
    index: number;
}

const FeilutbetalingPeriode: React.FC<IProps> = ({ periode, hendelseTyper, index }) => {
    const [hendelseUnderTyper, settHendelseUnderTyper] = React.useState<Array<HendelseUndertype>>();

    React.useEffect(() => {
        if (periode.feilutbetalingÅrsakDto) {
            settHendelseUnderTyper(
                hentHendelseUndertyper(periode.feilutbetalingÅrsakDto.hendelseType)
            );
        }
    }, [periode.feilutbetalingÅrsakDto]);

    const onChangeÅrsak = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const årsak = HendelseType[e.target.value as keyof typeof HendelseType];
        settHendelseUnderTyper(hentHendelseUndertyper(årsak));
    };

    const onChangeUnderÅrsak = (_e: React.ChangeEvent<HTMLSelectElement>) => {
        // TODO:
    };

    return (
        <tr>
            <td>
                <Undertekst>{`${periode.fom} - ${periode.tom}`}</Undertekst>
            </td>
            <td>
                <FamilieSelect
                    id={`perioder.${index}.årsak`}
                    onChange={event => onChangeÅrsak(event)}
                    value={
                        periode.feilutbetalingÅrsakDto
                            ? periode.feilutbetalingÅrsakDto.hendelseType
                            : '-'
                    }
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
                        onChange={event => onChangeUnderÅrsak(event)}
                        value={
                            periode.feilutbetalingÅrsakDto
                                ? periode.feilutbetalingÅrsakDto.hendelseUndertype
                                : '-'
                        }
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

export default FeilutbetalingPeriode;
