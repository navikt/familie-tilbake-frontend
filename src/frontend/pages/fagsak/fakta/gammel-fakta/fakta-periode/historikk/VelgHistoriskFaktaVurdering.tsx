import type { ChangeEvent, FC } from 'react';
import type { FaktaResponse } from '@/typer/tilbakekrevingstyper';

import { Select } from '@navikt/ds-react';
import { parseISO } from 'date-fns';

import { formatterDatoOgTidstring } from '@/utils';

type Props = {
    inaktiveFakta: FaktaResponse[];
    setInaktivFakta: (valgtFakta?: FaktaResponse) => void;
};

export const VelgHistoriskFaktaVurdering: FC<Props> = ({
    inaktiveFakta,
    setInaktivFakta,
}: Props) => {
    return (
        <Select
            onChange={(e: ChangeEvent<HTMLSelectElement, Element>): void => {
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
