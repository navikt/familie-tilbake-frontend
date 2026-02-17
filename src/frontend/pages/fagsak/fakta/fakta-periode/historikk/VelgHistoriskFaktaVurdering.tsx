import type { FaktaResponse } from '../../../../../typer/tilbakekrevingstyper';

import { Select } from '@navikt/ds-react';
import { parseISO } from 'date-fns';
import * as React from 'react';

import { formatterDatoOgTidstring } from '../../../../../utils';

type Props = {
    inaktiveFakta: FaktaResponse[];
    setInaktivFakta: (valgtFakta?: FaktaResponse) => void;
};

export const VelgHistoriskFaktaVurdering: React.FC<Props> = ({
    inaktiveFakta,
    setInaktivFakta,
}) => {
    return (
        <Select
            onChange={e => {
                const valgtVurdering = inaktiveFakta.find(
                    fakta => fakta.opprettetTid === e.target.value
                );
                setInaktivFakta(valgtVurdering);
            }}
            label="Velg versjon"
        >
            <option>Velg</option>
            {inaktiveFakta
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
