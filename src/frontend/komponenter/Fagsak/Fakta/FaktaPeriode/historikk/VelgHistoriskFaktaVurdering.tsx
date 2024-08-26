import * as React from 'react';

import { parseISO } from 'date-fns';

import { Select } from '@navikt/ds-react';

import { IFeilutbetalingFakta } from '../../../../../typer/feilutbetalingtyper';
import { formatterDatoOgTidstring } from '../../../../../utils';

interface IProps {
    feilutbetalingInaktiveFakta: IFeilutbetalingFakta[];
    settFeilutbetalingInaktivFakta: (valgtFakta?: IFeilutbetalingFakta) => void;
}

const VelgHistoriskFaktaVurdering: React.FC<IProps> = ({
    feilutbetalingInaktiveFakta,
    settFeilutbetalingInaktivFakta,
}) => {
    return (
        <Select
            onChange={e => {
                const valgtVurdering = feilutbetalingInaktiveFakta.find(
                    fakta => fakta.opprettetTid === e.target.value
                );
                settFeilutbetalingInaktivFakta(valgtVurdering);
            }}
            label={'Velg versjon'}
        >
            <option>Velg</option>
            {feilutbetalingInaktiveFakta
                .sort((a, b) => {
                    return a.opprettetTid && b.opprettetTid
                        ? parseISO(b.opprettetTid).getTime() - parseISO(a.opprettetTid).getTime()
                        : 1;
                })
                .map((vurdering, index) => {
                    return (
                        vurdering.opprettetTid && (
                            <option value={vurdering.opprettetTid} key={index}>
                                Endret {formatterDatoOgTidstring(vurdering.opprettetTid)}
                            </option>
                        )
                    );
                })}
        </Select>
    );
};

export default VelgHistoriskFaktaVurdering;
