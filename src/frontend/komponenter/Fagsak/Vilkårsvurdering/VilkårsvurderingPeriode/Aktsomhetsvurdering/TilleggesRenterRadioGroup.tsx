import * as React from 'react';
import { BodyShort, Label, Radio } from '@navikt/ds-react';
import { HorisontalRadioGroup } from '../../../../Felleskomponenter/Skjemaelementer';
import { JaNeiOption, jaNeiOptions } from '../VilkårsvurderingPeriodeSkjemaContext';
import type { Felt } from '@navikt/familie-skjema';

interface IProps {
    erLesevisning: boolean;
    kanIlleggeRenter: boolean;
    skjemafelt: Felt<JaNeiOption | ''>;
    ugyldigIlleggRenterValgt: boolean;
}
const TilleggesRenterRadioGroup: React.FC<IProps> = ({
    erLesevisning,
    kanIlleggeRenter,
    skjemafelt,
    ugyldigIlleggRenterValgt,
}) => {
    return (
        <>
            {erLesevisning || !kanIlleggeRenter ? (
                <>
                    <Label>Skal det tillegges renter?</Label>
                    <BodyShort>{skjemafelt.verdi && skjemafelt.verdi.label}</BodyShort>
                </>
            ) : (
                <HorisontalRadioGroup
                    id="skalDetTilleggesRenter"
                    legend={'Skal det tillegges renter?'}
                    value={skjemafelt.verdi}
                    error={ugyldigIlleggRenterValgt ? skjemafelt.feilmelding?.toString() : ''}
                    marginbottom="none"
                    onChange={(val: JaNeiOption) => skjemafelt.validerOgSettFelt(val)}
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
            )}
        </>
    );
};

export default TilleggesRenterRadioGroup;
