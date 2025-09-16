import type { VilkårsvurderingResponse } from '../../../../typer/tilbakekrevingstyper';

import { Select } from '@navikt/ds-react';
import { parseISO } from 'date-fns';
import * as React from 'react';

import { formatterDatoOgTidstring } from '../../../../utils';

interface IProps {
    inaktiveVilkårsvurderinger: VilkårsvurderingResponse[];
    setInaktivVilkårsvurdering: (valgtFakta?: VilkårsvurderingResponse) => void;
}

const VelgHistoriskVilkårsvurdering: React.FC<IProps> = ({
    inaktiveVilkårsvurderinger,
    setInaktivVilkårsvurdering,
}) => {
    return (
        <Select
            onChange={e => {
                const valgtVurdering = inaktiveVilkårsvurderinger.find(
                    vurdering => vurdering.opprettetTid === e.target.value
                );
                setInaktivVilkårsvurdering(valgtVurdering);
            }}
            label="Velg versjon"
        >
            <option>Velg</option>
            {inaktiveVilkårsvurderinger
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
