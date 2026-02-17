import type { ForhåndsvarselFormData } from '../schema';

import { RadioGroup, Radio, Textarea, Link } from '@navikt/ds-react';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { useBehandlingState } from '../../../../context/BehandlingStateContext';

export const Unntak: React.FC = () => {
    const methods = useFormContext<ForhåndsvarselFormData>();
    const { behandlingILesemodus } = useBehandlingState();
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
                        readOnly={behandlingILesemodus}
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
                        <Radio value="IKKE_PRAKTISK_MULIG">
                            Varsling er ikke praktisk mulig eller vil hindre gjennomføring av
                            vedtaket (Forvaltningsloven §16a)
                        </Radio>
                        <Radio value="UKJENT_ADRESSE_ELLER_URIMELIG_ETTERSPORING">
                            Mottaker av varselet har ukjent adresse og ettersporing er urimelig
                            ressurskrevende (Forvaltningsloven §16b)
                        </Radio>
                        <Radio value="ÅPENBART_UNØDVENDIG">
                            Varsel anses som åpenbart unødvendig eller mottaker av varselet er
                            allerede kjent med saken og har hatt mulighet til å uttale seg
                            (Forvaltningsloven §16c)
                        </Radio>
                    </RadioGroup>
                )}
            />

            <Textarea
                {...methods.register('beskrivelse')}
                label="Forklar hvorfor forhåndsvarselet ikke skal bli sendt"
                maxLength={2000}
                minRows={3}
                size="small"
                readOnly={behandlingILesemodus}
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
