import type { Felt } from '../../../../../hooks/skjema';
import type { JaNeiOption } from '../VilkårsvurderingPeriodeSkjemaContext';

import { BodyShort, Label, Radio } from '@navikt/ds-react';
import * as React from 'react';

import { useBehandling } from '../../../../../context/BehandlingContext';
import { Valideringsstatus } from '../../../../../hooks/skjema';
import { HorisontalRadioGroup } from '../../../../Felleskomponenter/Skjemaelementer';
import { jaNeiOptions } from '../VilkårsvurderingPeriodeSkjemaContext';

type Props = {
    erLesevisning: boolean;
    kanIlleggeRenter: boolean;
    felt: Felt<JaNeiOption | ''>;
    visFeilmeldingerForSkjema: boolean;
};
const TilleggesRenterRadioGroup: React.FC<Props> = ({
    erLesevisning,
    kanIlleggeRenter,
    felt,
    visFeilmeldingerForSkjema,
}) => {
    const { settIkkePersistertKomponent } = useBehandling();

    return erLesevisning || !kanIlleggeRenter ? (
        <div>
            <Label>Skal det tillegges renter?</Label>
            <BodyShort>{felt.verdi && felt.verdi.label}</BodyShort>
        </div>
    ) : (
        <HorisontalRadioGroup
            id="skalDetTilleggesRenter"
            legend="Skal det tillegges renter?"
            value={felt.verdi}
            size="small"
            className="w-100"
            error={
                visFeilmeldingerForSkjema &&
                felt.valideringsstatus === Valideringsstatus.Feil &&
                felt.feilmelding
            }
            marginbottom="none"
            onChange={(val: JaNeiOption) => {
                felt.validerOgSettFelt(val);
                settIkkePersistertKomponent(`vilkårsvurdering`);
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
        </HorisontalRadioGroup>
    );
};

export default TilleggesRenterRadioGroup;
