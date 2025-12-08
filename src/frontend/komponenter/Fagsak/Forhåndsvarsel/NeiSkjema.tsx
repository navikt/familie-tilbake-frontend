import type { ForhåndsvarselFormData } from './validering';
import type { UseFormReturn } from 'react-hook-form/dist/types/form';

import { RadioGroup, Radio, Textarea, Link } from '@navikt/ds-react';
import React from 'react';
import { Controller } from 'react-hook-form';

type Props = {
    methods: UseFormReturn<ForhåndsvarselFormData>;
};

enum BegrunnelseUnntak {
    //TODO: erstatte med kodeverk fra backend når det er på plass
    IkkePraktiskMulig = 'IkkePraktiskMulig',
    UrimeligRessurskrevende = 'UrimeligRessurskrevende',
    ÅpenbartUnødvendig = 'ÅpenbartUnødvendig',
}

export const NeiSkjema: React.FC<Props> = ({ methods }) => {
    return (
        <>
            <Controller
                control={methods.control}
                name="begrunnelseForUnntak"
                render={({ field }) => (
                    <RadioGroup
                        {...field}
                        legend="Velg begrunnelse for unntak fra forhåndsvarsel"
                        size="small"
                        className="max-w-xl"
                        description={
                            <>
                                Varsling kan unnlates dersom det ikke er praktisk, urimelig
                                ressurskrevende, eller åpenbart unødvendig. Les mer om{' '}
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
                        error={
                            'begrunnelseForUnntak' in methods.formState.errors
                                ? methods.formState.errors.begrunnelseForUnntak?.message?.toString()
                                : undefined
                        }
                    >
                        <Radio
                            value={BegrunnelseUnntak.IkkePraktiskMulig}
                            description="Forvaltningsloven §16a"
                        >
                            Varsling er ikke praktisk mulig eller vil hindre gjennomføring av
                            vedtaket
                        </Radio>
                        <Radio
                            value={BegrunnelseUnntak.UrimeligRessurskrevende}
                            description="Forvaltningsloven §16b"
                        >
                            Mottaker av varselet har ukjent adresse og ettersporing er urimelig
                            ressurskrevende
                        </Radio>
                        <Radio
                            value={BegrunnelseUnntak.ÅpenbartUnødvendig}
                            description="Forvaltningsloven §16c"
                        >
                            Varsel anses som åpenbart unødvendig eller mottaker av varselet er
                            allerede kjent med saken og har hatt mulighet til å uttale seg
                        </Radio>
                    </RadioGroup>
                )}
            />

            <Textarea
                {...methods.register('beskrivelse')}
                label="Forklar hvorfor forhåndsvarselet ikke skal bli sendt"
                maxLength={2000}
                size="small"
                className="max-w-xl"
                error={
                    'beskrivelse' in methods.formState.errors
                        ? methods.formState.errors.beskrivelse?.message?.toString()
                        : undefined
                }
            />
        </>
    );
};
