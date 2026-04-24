import type { FC } from 'react';
import type { VilkårsvurderingResponse } from '~/typer/tilbakekrevingstyper';

import { Select } from '@navikt/ds-react';
import { parseISO } from 'date-fns';

import { formatterDatoOgTidstring } from '~/utils';

type Props = {
    inaktiveVilkårsvurderinger: VilkårsvurderingResponse[];
    setInaktivVilkårsvurdering: (valgtFakta?: VilkårsvurderingResponse) => void;
};

export const VelgHistoriskVilkårsvurdering: FC<Props> = ({
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
                .map(vurdering => {
                    return (
                        vurdering.opprettetTid && (
                            <option value={vurdering.opprettetTid} key={vurdering.opprettetTid}>
                                Endret {formatterDatoOgTidstring(vurdering.opprettetTid)}
                            </option>
                        )
                    );
                })}
        </Select>
    );
};
