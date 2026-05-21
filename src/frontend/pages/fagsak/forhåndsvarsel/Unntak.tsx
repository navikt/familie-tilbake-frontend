import type { IkkeVurdertFormData } from './schema';
import type { FC } from 'react';

import { Link, Radio, RadioGroup, Textarea, VStack } from '@navikt/ds-react';
import { useFormContext } from 'react-hook-form';

import { useBehandlingState } from '~/context/BehandlingStateContext';

export const Unntak: FC = () => {
    const { behandlingILesemodus } = useBehandlingState();
    const { register, formState } = useFormContext<IkkeVurdertFormData>();
    const { errors } = formState;
    const { name, ...radioProps } = register('begrunnelseForUnntak');

    return (
        <VStack gap="space-24">
            <RadioGroup
                name={name}
                legend="Velg begrunnelse for unntak fra forhåndsvarsel"
                size="small"
                readOnly={behandlingILesemodus}
                className="max-w-xl"
                description={
                    <>
                        Varsling kan unnlates dersom det ikke er praktisk, urimelig ressurskrevende,
                        eller åpenbart unødvendig. Les mer om{' '}
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
                    'begrunnelseForUnntak' in errors
                        ? errors.begrunnelseForUnntak?.message
                        : undefined
                }
            >
                <Radio value="IKKE_PRAKTISK_MULIG" {...radioProps}>
                    Varsling er ikke praktisk mulig eller vil hindre gjennomføring av vedtaket
                    (Forvaltningsloven §16a)
                </Radio>
                <Radio value="UKJENT_ADRESSE_ELLER_URIMELIG_ETTERSPORING" {...radioProps}>
                    Mottaker av varselet har ukjent adresse og ettersporing er urimelig
                    ressurskrevende (Forvaltningsloven §16b)
                </Radio>
                <Radio value="ÅPENBART_UNØDVENDIG" {...radioProps}>
                    Varsel anses som åpenbart unødvendig eller mottaker av varselet er allerede
                    kjent med saken og har hatt mulighet til å uttale seg (Forvaltningsloven §16c)
                </Radio>
            </RadioGroup>
            <Textarea
                {...register('beskrivelse')}
                label="Forklar hvorfor forhåndsvarselet ikke skal bli sendt"
                maxLength={2000}
                minRows={3}
                size="small"
                readOnly={behandlingILesemodus}
                className="max-w-xl"
                resize
                error={'beskrivelse' in errors ? errors.beskrivelse?.message : undefined}
            />
        </VStack>
    );
};
