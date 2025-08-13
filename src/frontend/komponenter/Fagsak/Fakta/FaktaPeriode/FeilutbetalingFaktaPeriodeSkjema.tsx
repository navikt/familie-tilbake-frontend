import type { HendelseUndertype } from '../../../../kodeverk';
import type { FaktaPeriodeSkjemaData } from '../typer/feilutbetalingFakta';

import { BodyShort, Select, Table, VStack } from '@navikt/ds-react';
import { ASpacing1 } from '@navikt/ds-tokens/dist/tokens';
import classNames from 'classnames';
import * as React from 'react';

import { useBehandling } from '../../../../context/BehandlingContext';
import {
    HendelseType,
    hendelsetyper,
    hendelseundertyper,
    hentHendelseUndertyper,
} from '../../../../kodeverk';
import { formatterDatostring, formatCurrencyNoKr } from '../../../../utils';
import { useFeilutbetalingFakta } from '../FeilutbetalingFaktaContext';

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
    const [hendelseUnderTyper, settHendelseUnderTyper] = React.useState<HendelseUndertype[]>();
    const { oppdaterUnderårsakPåPeriode, visFeilmeldinger, feilmeldinger, oppdaterÅrsakPåPeriode } =
        useFeilutbetalingFakta();
    const { settIkkePersistertKomponent } = useBehandling();

    React.useEffect(() => {
        if (hendelseTyper?.length === 1 && hendelseTyper[0] === HendelseType.Annet) {
            settHendelseUnderTyper(hentHendelseUndertyper(hendelseTyper[0]));
        } else if (periode.hendelsestype) {
            settHendelseUnderTyper(hentHendelseUndertyper(periode.hendelsestype));
        } else if (erLesevisning || !periode.hendelsestype) {
            // når det er lesevisning og perioden ikke er behandlet
            settHendelseUnderTyper([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [periode, hendelseTyper]);

    const onChangeÅrsak = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const årsak = e.target.value as HendelseType;
        settHendelseUnderTyper(hentHendelseUndertyper(årsak));
        settIkkePersistertKomponent('fakta');
        oppdaterÅrsakPåPeriode(periode, årsak);
    };

    const onChangeUnderÅrsak = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const underÅrsak = e.target.value as HendelseUndertype;
        settIkkePersistertKomponent('fakta');
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
                <VStack gap="1" className={`mt-[${ASpacing1}]`}>
                    {erLesevisning ? (
                        <BodyShort size="small">
                            {periode.hendelsestype && hendelsetyper[periode.hendelsestype]}
                        </BodyShort>
                    ) : (
                        <Select
                            key={`arsak-${index}-${hendelseTyper?.length || 0}`}
                            id={`perioder.${index}.årsak`}
                            data-testid={`perioder.${index}.årsak`}
                            label="Årsak"
                            hideLabel
                            defaultValue={
                                hendelseTyper?.length === 1
                                    ? hendelseTyper[0]
                                    : periode.hendelsestype || '-'
                            }
                            onChange={event => onChangeÅrsak(event)}
                            error={
                                visFeilmeldinger &&
                                feilmeldinger?.find(
                                    meld =>
                                        meld.periode === periode.index && meld.gjelderHendelsetype
                                )?.melding
                            }
                            size="small"
                        >
                            <option>-</option>
                            {hendelseTyper?.map(type => (
                                <option key={type} value={type}>
                                    {hendelsetyper[type]}
                                </option>
                            ))}
                        </Select>
                    )}
                    {hendelseUnderTyper &&
                        hendelseUnderTyper.length > 0 &&
                        (erLesevisning ? (
                            <BodyShort size="small">
                                {periode.hendelsesundertype &&
                                    hendelseundertyper[periode.hendelsesundertype]}
                            </BodyShort>
                        ) : (
                            <Select
                                key={`underarsak-${index}-${hendelseUnderTyper?.length || 0}`}
                                id={`perioder.${index}.underårsak`}
                                data-testid={`perioder.${index}.underårsak`}
                                label="Underårsak"
                                hideLabel
                                defaultValue={
                                    hendelseUnderTyper?.length === 1
                                        ? hendelseUnderTyper[0]
                                        : periode.hendelsesundertype || '-'
                                }
                                onChange={event => onChangeUnderÅrsak(event)}
                                error={
                                    visFeilmeldinger &&
                                    feilmeldinger?.find(
                                        meld =>
                                            meld.periode === periode.index &&
                                            meld.gjelderHendelseundertype
                                    )?.melding
                                }
                                size="small"
                            >
                                <option>-</option>
                                {hendelseUnderTyper.map(type => (
                                    <option key={type} value={type}>
                                        {hendelseundertyper[type]}
                                    </option>
                                ))}
                            </Select>
                        ))}
                </VStack>
            </Table.DataCell>
            <Table.DataCell align="right" className={classNames('redText')}>
                <BodyShort size="small">{formatCurrencyNoKr(periode.feilutbetaltBeløp)}</BodyShort>
            </Table.DataCell>
        </Table.Row>
    );
};

export default FeilutbetalingFaktaPeriode;
