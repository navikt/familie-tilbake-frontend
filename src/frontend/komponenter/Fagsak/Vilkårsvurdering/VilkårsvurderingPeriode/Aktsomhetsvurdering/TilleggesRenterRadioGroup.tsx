import type { Felt } from '../../../../../hooks/skjema';
import type { JaNeiOption } from '../VilkårsvurderingPeriodeSkjemaContext';

import { Radio, RadioGroup, Stack } from '@navikt/ds-react';
import * as React from 'react';

import { useBehandlingState } from '../../../../../context/BehandlingStateContext';
import { Valideringsstatus } from '../../../../../hooks/skjema';
import { jaNeiOptions, OptionJA, OptionNEI } from '../VilkårsvurderingPeriodeSkjemaContext';

type Props = {
    kanIlleggeRenter: boolean;
    felt: Felt<JaNeiOption | ''>;
    readOnly: boolean;
    feilaktigForsett?: boolean;
    visFeilmeldingerForSkjema: boolean;
};

const TilleggesRenterRadioGroup: React.FC<Props> = ({
    kanIlleggeRenter,
    felt,
    readOnly,
    feilaktigForsett,
    visFeilmeldingerForSkjema,
}) => {
    const { settIkkePersistertKomponent } = useBehandlingState();
    const value = !feilaktigForsett ? felt.verdi : kanIlleggeRenter ? OptionJA : OptionNEI;
    return (
        <RadioGroup
            id="skalDetTilleggesRenter"
            legend="Skal det beregnes 10% rentetillegg?"
            value={value}
            size="small"
            aria-live="polite"
            readOnly={readOnly || !kanIlleggeRenter}
            error={
                visFeilmeldingerForSkjema &&
                felt.valideringsstatus === Valideringsstatus.Feil &&
                felt.feilmelding
            }
            onChange={(val: JaNeiOption) => {
                felt.validerOgSettFelt(val);
                settIkkePersistertKomponent(`vilkårsvurdering`);
            }}
        >
            <Stack gap="space-0 space-24" direction={{ xs: 'column', sm: 'row' }} wrap={false}>
                {jaNeiOptions.map(opt => (
                    <Radio
                        key={opt.label}
                        name="skalDetTilleggesRenter"
                        value={opt}
                        data-testid={`skalDetTilleggesRenter_${opt.label}`}
                    >
                        {opt.label}
                    </Radio>
                ))}
            </Stack>
        </RadioGroup>
    );
};

export default TilleggesRenterRadioGroup;
