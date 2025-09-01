import type { HendelseType, HendelseUndertype } from '../../../../kodeverk';
import type { FaktaPeriodeSkjemaData } from '../typer/feilutbetalingFakta';

import { BodyShort, Select, Table, VStack } from '@navikt/ds-react';
import { ASpacing1 } from '@navikt/ds-tokens/dist/tokens';
import classNames from 'classnames';
import * as React from 'react';
import { useMemo } from 'react';

import { useBehandling } from '../../../../context/BehandlingContext';
import { hendelsetyper, hendelseundertyper, hentHendelseUndertyper } from '../../../../kodeverk';
import { formatterDatostring, formatCurrencyNoKr } from '../../../../utils';
import { useFeilutbetalingFakta } from '../FeilutbetalingFaktaContext';

interface Props {
    periode: FaktaPeriodeSkjemaData;
    hendelseTyper: HendelseType[] | undefined;
    index: number;
    erLesevisning: boolean;
}

export const FaktaPeriodeSkjema: React.FC<Props> = ({
    periode,
    hendelseTyper,
    index,
    erLesevisning,
}) => {
    const { oppdaterUnderårsakPåPeriode, visFeilmeldinger, feilmeldinger, oppdaterÅrsakPåPeriode } =
        useFeilutbetalingFakta();
    const { settIkkePersistertKomponent } = useBehandling();

    const aktuellHendelsetype = useMemo(() => {
        if (periode.hendelsestype) {
            return periode.hendelsestype;
        }

        if (hendelseTyper?.length === 1) {
            setTimeout(() => {
                oppdaterÅrsakPåPeriode(periode, hendelseTyper[0]);
            }, 0);
            return hendelseTyper[0];
        }

        return undefined;
    }, [hendelseTyper, periode, oppdaterÅrsakPåPeriode]);

    const hendelseUnderTyper = useMemo(() => {
        return aktuellHendelsetype ? hentHendelseUndertyper(aktuellHendelsetype) : [];
    }, [aktuellHendelsetype]);

    const aktuellHendelseundertype = useMemo(() => {
        if (periode.hendelsesundertype) {
            return periode.hendelsesundertype;
        }

        if (hendelseUnderTyper.length === 1 && aktuellHendelsetype) {
            setTimeout(() => {
                oppdaterUnderårsakPåPeriode(periode, hendelseUnderTyper[0]);
            }, 0);
            return hendelseUnderTyper[0];
        }

        return undefined;
    }, [hendelseUnderTyper, aktuellHendelsetype, periode, oppdaterUnderårsakPåPeriode]);

    const onChangeÅrsak = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const årsak = e.target.value === '-' ? undefined : (e.target.value as HendelseType);
        oppdaterÅrsakPåPeriode(periode, årsak);
        settIkkePersistertKomponent('fakta');
    };

    const onChangeUnderÅrsak = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const underÅrsak =
            e.target.value === '-' ? undefined : (e.target.value as HendelseUndertype);
        oppdaterUnderårsakPåPeriode(periode, underÅrsak);
        settIkkePersistertKomponent('fakta');
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
                            {aktuellHendelsetype && hendelsetyper[aktuellHendelsetype]}
                        </BodyShort>
                    ) : (
                        <Select
                            key={`arsak-${index}-${hendelseTyper?.length || 0}`}
                            id={`perioder.${index}.årsak`}
                            data-testid={`perioder.${index}.årsak`}
                            label="Årsak"
                            hideLabel
                            onChange={event => onChangeÅrsak(event)}
                            value={aktuellHendelsetype || '-'}
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
                                {aktuellHendelseundertype &&
                                    hendelseundertyper[aktuellHendelseundertype]}
                            </BodyShort>
                        ) : (
                            <Select
                                key={`underarsak-${index}-${hendelseUnderTyper?.length || 0}`}
                                id={`perioder.${index}.underårsak`}
                                data-testid={`perioder.${index}.underårsak`}
                                label="Underårsak"
                                hideLabel
                                onChange={event => onChangeUnderÅrsak(event)}
                                value={aktuellHendelseundertype || '-'}
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
