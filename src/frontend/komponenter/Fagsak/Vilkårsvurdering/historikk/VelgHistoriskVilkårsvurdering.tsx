import * as React from 'react';

import { parseISO } from 'date-fns';

import { Select } from '@navikt/ds-react';

import { IFeilutbetalingVilkårsvurdering } from '../../../../typer/feilutbetalingtyper';
import { formatterDatoOgTidstring } from '../../../../utils';

interface IProps {
    feilutbetalingInaktiveVilkårsvurderinger: IFeilutbetalingVilkårsvurdering[];
    settFeilutbetalingInaktivVilkårsvurdering: (
        valgtFakta?: IFeilutbetalingVilkårsvurdering
    ) => void;
}

const VelgHistoriskVilkårsvurdering: React.FC<IProps> = ({
    feilutbetalingInaktiveVilkårsvurderinger,
    settFeilutbetalingInaktivVilkårsvurdering,
}) => {
    return (
        <Select
            onChange={e => {
                const valgtVurdering = feilutbetalingInaktiveVilkårsvurderinger.find(
                    vurdering => vurdering.opprettetTid === e.target.value
                );
                settFeilutbetalingInaktivVilkårsvurdering(valgtVurdering);
            }}
            label="Velg versjon"
        >
            <option>Velg</option>
            {feilutbetalingInaktiveVilkårsvurderinger
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

export default VelgHistoriskVilkårsvurdering;
