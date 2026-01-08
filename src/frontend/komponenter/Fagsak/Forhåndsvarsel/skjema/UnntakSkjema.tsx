import type { ForhåndsvarselFormData } from '../forhåndsvarselSchema';

import { RadioGroup, Radio, Textarea, Link } from '@navikt/ds-react';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

type Props = {
    readOnly: boolean;
};

export const Unntak: React.FC<Props> = ({ readOnly }) => {
    const methods = useFormContext<ForhåndsvarselFormData>();
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
                        readOnly={readOnly}
                        value={field.value ?? ''}
                        className="max-w-xl"
                        description={
                            <>
                                Varsling kan unnlates dersom det ikke er praktisk, urimelig
                                ressurskrevende, eller åpenbart unødvendig. Les mer om{' '}
                                <Link
                                    href="https://lovdata.no/dokument/NL/lov/1967-02-10/KAPITTEL_4#%C2%A716"
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
                        <Radio value="IKKE_PRAKTISK_MULIG" description="Forvaltningsloven §16a">
                            Varsling er ikke praktisk mulig eller vil hindre gjennomføring av
                            vedtaket
                        </Radio>
                        <Radio
                            value="UKJENT_ADRESSE_ELLER_URIMELIG_ETTERSPORING"
                            description="Forvaltningsloven §16b"
                        >
                            Mottaker av varselet har ukjent adresse og ettersporing er urimelig
                            ressurskrevende
                        </Radio>
                        <Radio value="ÅPENBART_UNØDVENDIG" description="Forvaltningsloven §16c">
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
                readOnly={readOnly}
                className="max-w-xl"
                resize
                error={
                    'beskrivelse' in methods.formState.errors
                        ? methods.formState.errors.beskrivelse?.message?.toString()
                        : undefined
                }
            />
        </>
    );
};
