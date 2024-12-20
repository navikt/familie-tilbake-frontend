import * as React from 'react';

import classNames from 'classnames';
import { styled } from 'styled-components';

import { BodyShort, Select, Table, VStack } from '@navikt/ds-react';
import { ASpacing1 } from '@navikt/ds-tokens/dist/tokens';

import { useBehandling } from '../../../../context/BehandlingContext';
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

const StyledVStack = styled(VStack)`
    margin-top: ${ASpacing1};
`;

interface IProps {
    periode: FaktaPeriodeSkjemaData;
    hendelseTyper: HendelseType[] | undefined;
    index: number;
    erLesevisning: boolean;
    settErBehandlingEndret: (val: boolean) => void;
}

const FeilutbetalingFaktaPeriode: React.FC<IProps> = ({
    periode,
    hendelseTyper,
    index,
    erLesevisning,
    settErBehandlingEndret,
}) => {
    const [hendelseUnderTyper, settHendelseUnderTyper] = React.useState<Array<HendelseUndertype>>();
    const { oppdaterUnderårsakPåPeriode, visFeilmeldinger, feilmeldinger, oppdaterÅrsakPåPeriode } =
        useFeilutbetalingFakta();
    const { settIkkePersistertKomponent } = useBehandling();

    React.useEffect(() => {
        if (periode.hendelsestype) {
            settHendelseUnderTyper(hentHendelseUndertyper(periode.hendelsestype));
        } else if (erLesevisning || !periode.hendelsestype) {
            // når det er lesevisning og perioden ikke er behandlet
            settHendelseUnderTyper([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [periode]);

    const onChangeÅrsak = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const årsak = HendelseType[e.target.value as keyof typeof HendelseType];
        settHendelseUnderTyper(hentHendelseUndertyper(årsak));
        settIkkePersistertKomponent('fakta');
        oppdaterÅrsakPåPeriode(periode, årsak);
        settErBehandlingEndret(true);
    };

    const onChangeUnderÅrsak = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const underÅrsak = HendelseUndertype[e.target.value as keyof typeof HendelseUndertype];
        settIkkePersistertKomponent('fakta');
        oppdaterUnderårsakPåPeriode(periode, underÅrsak);
        settErBehandlingEndret(true);
    };

    return (
        <Table.Row>
            <Table.DataCell>
                <BodyShort size="small">{`${formatterDatostring(
                    periode.periode.fom
                )} - ${formatterDatostring(periode.periode.tom)}`}</BodyShort>
            </Table.DataCell>
            <Table.DataCell>
                <StyledVStack gap="1">
                    {erLesevisning ? (
                        <BodyShort size="small">
                            {periode.hendelsestype && hendelsetyper[periode.hendelsestype]}
                        </BodyShort>
                    ) : (
                        <Select
                            id={`perioder.${index}.årsak`}
                            data-testid={`perioder.${index}.årsak`}
                            label={'Årsak'}
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
                            size={'small'}
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
                                id={`perioder.${index}.underårsak`}
                                data-testid={`perioder.${index}.underårsak`}
                                label={'Underårsak'}
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
                                size={'small'}
                            >
                                <option>-</option>
                                {hendelseUnderTyper.map(type => (
                                    <option key={type} value={type}>
                                        {hendelseundertyper[type]}
                                    </option>
                                ))}
                            </Select>
                        ))}
                </StyledVStack>
            </Table.DataCell>
            <Table.DataCell align="right" className={classNames('redText')}>
                <BodyShort size="small">{formatCurrencyNoKr(periode.feilutbetaltBeløp)}</BodyShort>
            </Table.DataCell>
        </Table.Row>
    );
};

export default FeilutbetalingFaktaPeriode;
