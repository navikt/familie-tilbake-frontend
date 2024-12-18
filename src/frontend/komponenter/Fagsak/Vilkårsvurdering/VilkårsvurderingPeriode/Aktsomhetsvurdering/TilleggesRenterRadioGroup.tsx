import * as React from 'react';

import { BodyShort, Label, Radio } from '@navikt/ds-react';
import type { Felt } from '@navikt/familie-skjema';
import { Valideringsstatus } from '@navikt/familie-skjema';

import { useBehandling } from '../../../../../context/BehandlingContext';
import { HorisontalRadioGroup } from '../../../../Felleskomponenter/Skjemaelementer';
import { JaNeiOption, jaNeiOptions } from '../VilkårsvurderingPeriodeSkjemaContext';

interface IProps {
    erLesevisning: boolean;
    kanIlleggeRenter: boolean;
    felt: Felt<JaNeiOption | ''>;
    visFeilmeldingerForSkjema: boolean;
    endreSide: (val: boolean) => void;
}
const TilleggesRenterRadioGroup: React.FC<IProps> = ({
    erLesevisning,
    kanIlleggeRenter,
    felt,
    visFeilmeldingerForSkjema,
    endreSide,
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
            legend={'Skal det tillegges renter?'}
            value={felt.verdi}
            error={
                visFeilmeldingerForSkjema &&
                felt.valideringsstatus === Valideringsstatus.FEIL &&
                felt.feilmelding
            }
            marginbottom="none"
            onChange={(val: JaNeiOption) => {
                felt.validerOgSettFelt(val);
                settIkkePersistertKomponent(`vilkårsvurdering`);
                endreSide(true);
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
