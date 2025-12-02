import type { ForhåndsvarselFormData } from './forhåndsvarselSchema';
import type { UseFormReturn } from 'react-hook-form/dist/types/form';

import { RadioGroup, Radio, Textarea, Link } from '@navikt/ds-react';
import React from 'react';

type Props = {
    methods: UseFormReturn<ForhåndsvarselFormData>;
};

enum BegrunnelseUnntak {
    //TODO: erstatte med kodeverk fra backend når det er på plass
    IkkePraktiskMulig = 'IkkePraktiskMulig',
    UrimeligRessurskrevende = 'UrimeligRessurskrevende',
    ÅpenbartUnødvendig = 'ÅpenbartUnødvendig',
}

export const Unntak: React.FC<Props> = ({ methods }) => {
    return (
        <>
            <RadioGroup
                {...methods.register('begrunnelseForUnntak')}
                legend="Velg begrunnelse for unntak fra forhåndsvarsel"
                size="small"
                className="max-w-xl"
                description={
                    <>
                        Varsling kan unnlates dersom det ikke er praktisk, urimelig ressurskrevende,
                        eller åpenbart unødvendig. Les mer om{' '}
                        <Link
                            href="https://lovdata.no/lov/1967-02-10-10/§16a"
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Les om Forvaltningsloven §16 på Lovdata.no"
                            inlineText
                        >
                            Forvaltningsloven §16.
                        </Link>
                    </>
                }
            >
                <Radio value={BegrunnelseUnntak.IkkePraktiskMulig}>
                    Varsling er ikke praktisk mulig eller vil hindre gjennomføring av vedtaket
                    (Forvaltningsloven §16a)
                </Radio>
                <Radio value={BegrunnelseUnntak.UrimeligRessurskrevende}>
                    Mottaker av varselet har ukjent adresse og ettersporing er urimelig
                    ressurskrevende (Forvaltningsloven §16b)
                </Radio>
                <Radio value={BegrunnelseUnntak.ÅpenbartUnødvendig}>
                    Varsel anses som åpenbart unødvendig eller mottaker av varselet er allerede
                    kjent med saken og har hatt mulighet til å uttale seg (Forvaltningsloven §16c)
                </Radio>
            </RadioGroup>

            <Textarea
                {...methods.register('beskrivelse')}
                label="Forklar hvorfor forhåndsvarselet ikke skal bli sendt"
                maxLength={2000}
            />
        </>
    );
};
