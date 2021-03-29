import * as React from 'react';

import classNames from 'classnames';

import { Normaltekst } from 'nav-frontend-typografi';

import { FamilieSelect } from '@navikt/familie-form-elements';

import {
    hendelsetyper,
    HendelseType,
    hendelseundertyper,
    HendelseUndertype,
    hentHendelseUndertyper,
} from '../../../../kodeverk';
import { FaktaPeriode } from '../../../../typer/feilutbetalingtyper';
import { formatterDatostring, formatCurrencyNoKr } from '../../../../utils';

interface IProps {
    periode: FaktaPeriode;
    hendelseTyper: Array<HendelseType> | undefined;
    index: number;
    erLesevisning: boolean;
}

const FeilutbetalingFaktaPeriode: React.FC<IProps> = ({
    periode,
    hendelseTyper,
    index,
    erLesevisning,
}) => {
    const [hendelseUnderTyper, settHendelseUnderTyper] = React.useState<Array<HendelseUndertype>>();
    const [valgtÅrsak, settValgtÅrsak] = React.useState<HendelseType>();
    const [valgtUnderÅrsak, settValgtUnderÅrsak] = React.useState<HendelseUndertype>();

    React.useEffect(() => {
        if (periode.hendelsestype) {
            settHendelseUnderTyper(hentHendelseUndertyper(periode.hendelsestype));
            settValgtÅrsak(periode.hendelsestype);
            settValgtUnderÅrsak(periode.hendelsesundertype);
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
                <Normaltekst>{`${formatterDatostring(periode.periode.fom)} - ${formatterDatostring(
                    periode.periode.tom
                )}`}</Normaltekst>
            </td>
            <td>
                <FamilieSelect
                    id={`perioder.${index}.årsak`}
                    label={'Årsak'}
                    onChange={event => onChangeÅrsak(event)}
                    value={valgtÅrsak ? valgtÅrsak : '-'}
                    erLesevisning={erLesevisning}
                    lesevisningVerdi={valgtÅrsak ? hendelsetyper[valgtÅrsak] : ''}
                >
                    <option>-</option>
                    {hendelseTyper?.map(type => (
                        <option key={type} value={type}>
                            {hendelsetyper[type]}
                        </option>
                    ))}
                </FamilieSelect>
                {hendelseUnderTyper && (
                    <FamilieSelect
                        id={`perioder.${index}.underårsak`}
                        label={'Underårsak'}
                        onChange={event => onChangeUnderÅrsak(event)}
                        value={valgtUnderÅrsak ? valgtUnderÅrsak : '-'}
                        erLesevisning={erLesevisning}
                        lesevisningVerdi={
                            valgtUnderÅrsak ? hendelseundertyper[valgtUnderÅrsak] : ''
                        }
                    >
                        <option>-</option>
                        {hendelseUnderTyper.map(type => (
                            <option key={type} value={type}>
                                {hendelseundertyper[type]}
                            </option>
                        ))}
                    </FamilieSelect>
                )}
            </td>
            <td className={classNames('redText')}>
                <Normaltekst>{formatCurrencyNoKr(periode.feilutbetaltBeløp)}</Normaltekst>
            </td>
        </tr>
    );
};

export default FeilutbetalingFaktaPeriode;
