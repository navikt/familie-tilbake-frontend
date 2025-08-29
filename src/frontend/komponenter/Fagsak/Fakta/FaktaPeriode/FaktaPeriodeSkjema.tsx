import type { HendelseType, HendelseUndertype } from '../../../../kodeverk';
import type { FaktaPeriodeSkjemaData } from '../typer/feilutbetalingFakta';

import { BodyShort, Select, Table, VStack } from '@navikt/ds-react';
import { ASpacing1 } from '@navikt/ds-tokens/dist/tokens';
import classNames from 'classnames';
import * as React from 'react';
import { useEffect, useState } from 'react';

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
    const [hendelseUnderTyper, settHendelseUnderTyper] = useState<HendelseUndertype[]>();
    const { oppdaterUnderårsakPåPeriode, visFeilmeldinger, feilmeldinger, oppdaterÅrsakPåPeriode } =
        useFeilutbetalingFakta();
    const { settIkkePersistertKomponent } = useBehandling();

    useEffect(() => {
        if (hendelseTyper?.length === 1) {
            const underTyper = hentHendelseUndertyper(hendelseTyper[0]);
            settHendelseUnderTyper(underTyper);

            if (!periode.hendelsestype) {
                settIkkePersistertKomponent('fakta');
                oppdaterÅrsakPåPeriode(periode, hendelseTyper[0]);
            }

            if (underTyper.length === 1 && !periode.hendelsesundertype) {
                settIkkePersistertKomponent('fakta');
                oppdaterUnderårsakPåPeriode(periode, underTyper[0]);
            }
        } else if (periode.hendelsestype) {
            settHendelseUnderTyper(hentHendelseUndertyper(periode.hendelsestype));
        } else if (erLesevisning || !periode.hendelsestype) {
            // når det er lesevisning og perioden ikke er behandlet
            settHendelseUnderTyper([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [periode, hendelseTyper]);

    useEffect(() => {
        //Hvis hendelsesType er satt og dens hendelsesundertype kun har 1 i lengde, så skal den være satt
        if (periode.hendelsestype && hentHendelseUndertyper(periode.hendelsestype)?.length === 1) {
            settIkkePersistertKomponent('fakta');
            hendelseUnderTyper && oppdaterUnderårsakPåPeriode(periode, hendelseUnderTyper[0]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [periode.hendelsestype]);

    const onChangeÅrsak = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const årsak = e.target.value as HendelseType;
        settHendelseUnderTyper(hentHendelseUndertyper(årsak));
        settIkkePersistertKomponent('fakta');
        oppdaterÅrsakPåPeriode(periode, årsak);
    };

    const onChangeUnderÅrsak = (e: React.ChangeEvent<HTMLSelectElement>): void => {
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
                            onChange={event => onChangeÅrsak(event)}
                            value={periode.hendelsestype || '-'}
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
                                onChange={event => onChangeUnderÅrsak(event)}
                                value={periode.hendelsesundertype || '-'}
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
