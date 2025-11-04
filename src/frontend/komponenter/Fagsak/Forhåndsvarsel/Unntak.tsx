import type { SkalSendesForhåndsvarsel } from './Forhåndsvarsel';
import type { UseFormReturn } from 'react-hook-form/dist/types/form';

import { VStack, RadioGroup, HStack, Radio, Textarea, Link } from '@navikt/ds-react';
import { ATextWidthMax } from '@navikt/ds-tokens/dist/tokens';
import React from 'react';

type Props = {
    methods: UseFormReturn<{
        skalSendesForhåndsvarsel: SkalSendesForhåndsvarsel | undefined;
        fritekst: string;
    }>;
};

enum BegrunnelseUnntak {
    //TODO: erstatte med kodeverk fra backend når det er på plass
    IkkePraktiskMulig = 'IkkePraktiskMulig',
    UrimeligRessurskrevende = 'UrimeligRessurskrevende',
    ÅpenbartUnødvendig = 'ÅpenbartUnødvendig',
}

export const Unntak: React.FC<Props> = ({ methods }) => {
    const {
        formState: { errors },
    } = methods;

    const maksAntallTegn = 2000;

    return (
        <VStack maxWidth={ATextWidthMax} gap="4">
            <RadioGroup
                legend="Velg begrunnelse for unntak fra forhåndsvarsel"
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
                error={errors.skalSendesForhåndsvarsel?.message?.toString()}
            >
                <HStack align="center" wrap gap="0 2">
                    <Radio value={BegrunnelseUnntak.IkkePraktiskMulig}>
                        Varsling er ikke praktisk mulig eller vil hindre gjennomføring av vedtaket
                        (Forvaltningsloven §16a)
                    </Radio>
                </HStack>
                <HStack align="center" wrap gap="0 2">
                    <Radio value={BegrunnelseUnntak.UrimeligRessurskrevende}>
                        Mottaker av varselet har ukjent adresse og ettersporing er urimelig
                        ressurskrevende (Forvaltningsloven §16b)
                    </Radio>
                </HStack>
                <HStack align="center" gap="0 2">
                    <Radio value={BegrunnelseUnntak.ÅpenbartUnødvendig}>
                        Varsel anses som åpenbart unødvendig eller mottaker av varselet er allerede
                        kjent med saken og har hatt mulighet til å uttale seg (Forvaltningsloven
                        §16c)
                    </Radio>
                </HStack>
            </RadioGroup>
            <Textarea
                label="Forklar hvorfor forhåndsvarselet ikke skal bli sendt"
                maxLength={maksAntallTegn}
            />
        </VStack>
    );
};
