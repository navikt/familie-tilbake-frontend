import type { FaktaPeriodeSkjemaData } from '../typer/fakta';
import type { ChangeEvent, FC } from 'react';
import type { HendelseType, HendelseUndertype } from '~/kodeverk';

import { BodyShort, Select, Table, VStack } from '@navikt/ds-react';
import { useEffect, useMemo } from 'react';

import { useBehandlingState } from '~/context/BehandlingStateContext';
import { hendelsetyper, hendelseundertyper, hentHendelseUndertyper } from '~/kodeverk';
import { useFakta } from '~/pages/fagsak/fakta/FaktaContext';
import { formatterDatostring, formatCurrencyNoKr } from '~/utils';

type Props = {
    periode: FaktaPeriodeSkjemaData;
    hendelseTyper: HendelseType[] | undefined;
    index: number;
    erHistoriskVisning?: boolean;
};

export const FaktaPeriodeSkjema: FC<Props> = ({
    periode,
    hendelseTyper,
    index,
    erHistoriskVisning,
}) => {
    const { oppdaterUnderårsakPåPeriode, visFeilmeldinger, feilmeldinger, oppdaterÅrsakPåPeriode } =
        useFakta();
    const { behandlingILesemodus, settIkkePersistertKomponent } = useBehandlingState();

    useEffect(() => {
        const skalAutoVelgeHendelsestype = !periode.hendelsestype && hendelseTyper?.length === 1;
        if (skalAutoVelgeHendelsestype) {
            oppdaterÅrsakPåPeriode(periode, hendelseTyper[0]);
            settIkkePersistertKomponent('fakta');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hendelseTyper]);

    const hendelseUnderTyper = useMemo(() => {
        return periode.hendelsestype ? hentHendelseUndertyper(periode.hendelsestype) : [];
    }, [periode.hendelsestype]);

    useEffect(() => {
        const skalAutoVelgeUnderType =
            !periode.hendelsesundertype &&
            hendelseUnderTyper.length === 1 &&
            !!periode.hendelsestype;
        if (skalAutoVelgeUnderType) {
            oppdaterUnderårsakPåPeriode(periode, hendelseUnderTyper[0]);
            settIkkePersistertKomponent('fakta');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hendelseUnderTyper]);

    const onChangeÅrsak = (e: ChangeEvent<HTMLSelectElement>): void => {
        const årsak = e.target.value === '-' ? undefined : (e.target.value as HendelseType);
        oppdaterÅrsakPåPeriode(periode, årsak);
        settIkkePersistertKomponent('fakta');
    };

    const onChangeUnderÅrsak = (e: ChangeEvent<HTMLSelectElement>): void => {
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
                <VStack gap="space-4" className="mt-1">
                    {behandlingILesemodus || erHistoriskVisning ? (
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
                            {hendelseTyper && hendelseTyper.length > 1 && <option>-</option>}
                            {hendelseTyper?.map(type => (
                                <option key={type} value={type}>
                                    {hendelsetyper[type]}
                                </option>
                            ))}
                        </Select>
                    )}
                    {hendelseUnderTyper &&
                        hendelseUnderTyper.length > 0 &&
                        (behandlingILesemodus || erHistoriskVisning ? (
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
                                {hendelseUnderTyper.length > 1 && <option>-</option>}
                                {hendelseUnderTyper.map(type => (
                                    <option key={type} value={type}>
                                        {hendelseundertyper[type]}
                                    </option>
                                ))}
                            </Select>
                        ))}
                </VStack>
            </Table.DataCell>
            <Table.DataCell align="right" className="text-ax-text-danger-subtle font-ax-bold">
                <BodyShort size="small">{formatCurrencyNoKr(periode.feilutbetaltBeløp)}</BodyShort>
            </Table.DataCell>
        </Table.Row>
    );
};
