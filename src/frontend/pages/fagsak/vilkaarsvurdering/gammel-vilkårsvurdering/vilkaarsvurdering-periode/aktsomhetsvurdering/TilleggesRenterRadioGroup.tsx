import type { FC } from 'react';
import type { Felt } from '~/hooks/skjema';
import type { JaNeiOption } from '~/pages/fagsak/vilkaarsvurdering/gammel-vilkårsvurdering/vilkaarsvurdering-periode/VilkårsvurderingPeriodeSkjemaContext';

import { Radio, RadioGroup } from '@navikt/ds-react';

import { useBehandling } from '~/context/BehandlingContext';
import { useBehandlingState } from '~/context/BehandlingStateContext';
import { Valideringsstatus } from '~/hooks/skjema';
import {
    jaNeiOptions,
    OptionJA,
    OptionNEI,
} from '~/pages/fagsak/vilkaarsvurdering/gammel-vilkårsvurdering/vilkaarsvurdering-periode/VilkårsvurderingPeriodeSkjemaContext';

type Props = {
    kanIlleggeRenter: boolean;
    felt: Felt<JaNeiOption | ''>;
    readOnly: boolean;
    erFeilaktigEllerMangelfull: boolean;
    visFeilmeldingerForSkjema: boolean;
};

export const TilleggesRenterRadioGroup: FC<Props> = ({
    kanIlleggeRenter,
    felt,
    readOnly,
    erFeilaktigEllerMangelfull,
    visFeilmeldingerForSkjema,
}) => {
    const { setIkkePersistertKomponent } = useBehandlingState();
    const { erNyModell } = useBehandling();
    const kanIleggeRenterValue = kanIlleggeRenter ? OptionJA : OptionNEI;
    const value = !erFeilaktigEllerMangelfull ? felt.verdi : kanIleggeRenterValue;

    return (
        <RadioGroup
            id="skalDetTilleggesRenter"
            legend="Skal det beregnes 10% rentetillegg?"
            value={value}
            size="small"
            aria-live="polite"
            readOnly={readOnly || !kanIlleggeRenter || (erFeilaktigEllerMangelfull && erNyModell)}
            error={
                visFeilmeldingerForSkjema &&
                felt.valideringsstatus === Valideringsstatus.Feil &&
                felt.feilmelding
            }
            onChange={(val: JaNeiOption) => {
                felt.validerOgSettFelt(val);
                setIkkePersistertKomponent(`vilkårsvurdering`);
            }}
        >
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
        </RadioGroup>
    );
};
