import type { FC } from 'react';
import type { ForhåndsvarselDto } from '~/generated';
import type { UttalelseFormData } from '~/pages/fagsak/forhåndsvarsel/schema';

import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Radio, RadioGroup, Textarea } from '@navikt/ds-react';
import { useEffect } from 'react';
import { useForm, useFormContext, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { useBehandlingState } from '~/context/BehandlingStateContext';
import { zBegrunnelseForUnntakEnum } from '~/generated/zod.gen';
import { HarUttaltSeg } from '~/pages/fagsak/forhåndsvarsel/schema';

import { UttalelseDetaljerListe } from './UttalelseDetaljerSkjema';

const unntakSchema = z.object({
    begrunnelseForUnntak: z.enum(zBegrunnelseForUnntakEnum.enum, {
        error: 'Du må velge en begrunnelse for unntak fra forhåndsvarsel',
    }),
    beskrivelse: z.string().min(1, 'Du må fylle inn en verdi'),
});

export type UnntakFormData = z.infer<typeof unntakSchema>;

type Props = {
    forhåndsvarselInfo: ForhåndsvarselDto | undefined;
    onSubmit: (unntakData: UnntakFormData | null, uttalelseData: UttalelseFormData | null) => void;
    navigerTilNeste: () => void;
    onDirtyChange?: (isDirty: boolean) => void;
};

export const UnntakMedUttalelse: FC<Props> = ({
    forhåndsvarselInfo,
    onSubmit,
    navigerTilNeste,
    onDirtyChange,
}) => {
    const { behandlingILesemodus } = useBehandlingState();
    const uttalelseMethods = useFormContext<UttalelseFormData>();

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isDirty: unntakIsDirty },
    } = useForm<UnntakFormData>({
        resolver: zodResolver(unntakSchema),
        defaultValues: {
            begrunnelseForUnntak: forhåndsvarselInfo?.forhåndsvarselUnntak?.begrunnelseForUnntak,
            beskrivelse: forhåndsvarselInfo?.forhåndsvarselUnntak?.beskrivelse ?? '',
        },
    });

    const begrunnelseForUnntak = useWatch({
        control,
        name: 'begrunnelseForUnntak',
    });
    const { name: begrunnelseName, ...begrunnelseRadioProps } = register('begrunnelseForUnntak');

    const harUttaltSeg = useWatch({
        control: uttalelseMethods.control,
        name: 'harUttaltSeg',
    });

    const { name: harUttaltSegName, ...harUttaltSegRadioProps } =
        uttalelseMethods.register('harUttaltSeg');

    const skalViseUttalelse = begrunnelseForUnntak === 'ÅPENBART_UNØDVENDIG';
    const uttalelseIsDirty = Object.keys(uttalelseMethods.formState.dirtyFields).length > 0;
    const uttalelseErLagret = !!forhåndsvarselInfo?.brukeruttalelse;
    const kombinertIsDirty =
        unntakIsDirty || (skalViseUttalelse && (uttalelseIsDirty || !uttalelseErLagret));

    useEffect(() => {
        onDirtyChange?.(kombinertIsDirty);
    }, [kombinertIsDirty, onDirtyChange]);

    const handleFormSubmit = handleSubmit(async unntakData => {
        const uttalelseMåSendes = skalViseUttalelse && (uttalelseIsDirty || !uttalelseErLagret);

        if (uttalelseMåSendes) {
            let uttalelseValid = false;
            await uttalelseMethods.handleSubmit(
                () => {
                    uttalelseValid = true;
                },
                () => {
                    uttalelseValid = false;
                }
            )();

            if (!uttalelseValid) return;

            onSubmit(unntakIsDirty ? unntakData : null, uttalelseMethods.getValues());
        } else if (unntakIsDirty) {
            onSubmit(unntakData, null);
        } else {
            navigerTilNeste();
        }
    });

    return (
        <form id="unntakForm" onSubmit={handleFormSubmit} className="flex flex-col gap-6">
            <RadioGroup
                name={begrunnelseName}
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
                error={errors.begrunnelseForUnntak?.message}
            >
                <Radio value="IKKE_PRAKTISK_MULIG" {...begrunnelseRadioProps}>
                    Varsling er ikke praktisk mulig eller vil hindre gjennomføring av vedtaket
                    (Forvaltningsloven §16a)
                </Radio>
                <Radio
                    value="UKJENT_ADRESSE_ELLER_URIMELIG_ETTERSPORING"
                    {...begrunnelseRadioProps}
                >
                    Mottaker av varselet har ukjent adresse og ettersporing er urimelig
                    ressurskrevende (Forvaltningsloven §16b)
                </Radio>
                <Radio value="ÅPENBART_UNØDVENDIG" {...begrunnelseRadioProps}>
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
                error={errors.beskrivelse?.message}
            />

            {skalViseUttalelse && (
                <>
                    <RadioGroup
                        name={harUttaltSegName}
                        size="small"
                        readOnly={behandlingILesemodus}
                        legend="Har brukeren uttalt seg?"
                        error={uttalelseMethods.formState.errors.harUttaltSeg?.message}
                    >
                        <Radio value={HarUttaltSeg.Ja} {...harUttaltSegRadioProps}>
                            Ja
                        </Radio>
                        <Radio value={HarUttaltSeg.Nei} {...harUttaltSegRadioProps}>
                            Nei
                        </Radio>
                    </RadioGroup>

                    {harUttaltSeg === HarUttaltSeg.Ja && <UttalelseDetaljerListe />}

                    {harUttaltSeg === HarUttaltSeg.Nei && (
                        <Textarea
                            {...uttalelseMethods.register('kommentar' as const)}
                            size="small"
                            readOnly={behandlingILesemodus}
                            label="Kommentar til valget over"
                            maxLength={4000}
                            minRows={3}
                            resize
                            className="max-w-xl"
                            error={
                                'kommentar' in uttalelseMethods.formState.errors
                                    ? (
                                          uttalelseMethods.formState.errors as {
                                              kommentar?: { message?: string };
                                          }
                                      ).kommentar?.message
                                    : undefined
                            }
                        />
                    )}
                </>
            )}
        </form>
    );
};
