import * as React from 'react';

import classNames from 'classnames';

import { BodyShort, Table } from '@navikt/ds-react';
import { FamilieSelect } from '@navikt/familie-form-elements';

import {
    hendelsetyper,
    HendelseType,
    hendelseundertyper,
    HendelseUndertype,
    hentHendelseUndertyper,
} from '../../../../kodeverk';
import { formatterDatostring, formatCurrencyNoKr } from '../../../../utils';
import { useFeilutbetalingFakta } from '../FeilutbetalingFaktaContext';
import { FaktaPeriodeSkjemaData } from '../typer/feilutbetalingFakta';

interface IProps {
    periode: FaktaPeriodeSkjemaData;
    hendelseTyper: HendelseType[] | undefined;
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
    const { oppdaterÅrsakPåPeriode, oppdaterUnderårsakPåPeriode, visFeilmeldinger, feilmeldinger } =
        useFeilutbetalingFakta();

    React.useEffect(() => {
        if (periode.hendelsestype) {
            settHendelseUnderTyper(hentHendelseUndertyper(periode.hendelsestype));
        } else if (erLesevisning) {
            // når det er lesevisning og perioden ikke er behandlet
            settHendelseUnderTyper([]);
        }
    }, [periode]);

    const onChangeÅrsak = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const årsak = HendelseType[e.target.value as keyof typeof HendelseType];
        settHendelseUnderTyper(hentHendelseUndertyper(årsak));
        oppdaterÅrsakPåPeriode(periode, årsak);
    };

    const onChangeUnderÅrsak = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const underÅrsak = HendelseUndertype[e.target.value as keyof typeof HendelseUndertype];
        oppdaterUnderårsakPåPeriode(periode, underÅrsak);
    };

    return (
        <Table.Row>
            <Table.DataCell>
                <BodyShort size="small">{`${formatterDatostring(
                    periode.periode.fom
                )} - ${formatterDatostring(periode.periode.tom)}`}</BodyShort>
            </Table.DataCell>
            <Table.DataCell>
                <FamilieSelect
                    id={`perioder.${index}.årsak`}
                    data-testid={`perioder.${index}.årsak`}
                    label={<span className="sr-only">Årsak</span>}
                    onChange={event => onChangeÅrsak(event)}
                    value={periode.hendelsestype || '-'}
                    erLesevisning={erLesevisning}
                    lesevisningVerdi={
                        periode.hendelsestype ? hendelsetyper[periode.hendelsestype] : ''
                    }
                    feil={
                        visFeilmeldinger &&
                        feilmeldinger?.find(
                            meld => meld.periode === periode.index && meld.gjelderHendelsetype
                        )?.melding
                    }
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
                        data-testid={`perioder.${index}.underårsak`}
                        label={<span className="sr-only">Underårsak</span>}
                        onChange={event => onChangeUnderÅrsak(event)}
                        value={periode.hendelsesundertype || '-'}
                        erLesevisning={erLesevisning}
                        lesevisningVerdi={
                            periode.hendelsesundertype
                                ? hendelseundertyper[periode.hendelsesundertype]
                                : ''
                        }
                        feil={
                            visFeilmeldinger &&
                            feilmeldinger?.find(
                                meld =>
                                    meld.periode === periode.index && meld.gjelderHendelseundertype
                            )?.melding
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
            </Table.DataCell>
            <Table.DataCell align="right" className={classNames('redText')}>
                <BodyShort size="small">{formatCurrencyNoKr(periode.feilutbetaltBeløp)}</BodyShort>
            </Table.DataCell>
        </Table.Row>
    );
};

export default FeilutbetalingFaktaPeriode;
