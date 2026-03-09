import type { FC } from 'react';
import type { Section, Varselbrevtekst } from '~/generated';

import { zodResolver } from '@hookform/resolvers/zod';
import { BodyLong, Heading, Textarea, VStack } from '@navikt/ds-react';
import { Fragment, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useBehandlingState } from '~/context/BehandlingStateContext';
import { BekreftelsesmodalMedState } from '~/komponenter/modal/bekreftelse/Bekreftelsesmodal';

const opprettForhåndsvarselSchema = z.object({
    fritekst: z.string().trim().min(1, 'Du må fylle inn en verdi').max(4000),
});

type OpprettForhåndsvarselFormData = z.infer<typeof opprettForhåndsvarselSchema>;

type Props = {
    varselbrevtekster: Varselbrevtekst | undefined;
    onBekreft: (fritekst: string) => void;
    isPending: boolean;
};

export const OpprettForhåndsvarsel: FC<Props> = ({ varselbrevtekster, onBekreft, isPending }) => {
    const maksAntallTegn = 4000;
    const { behandlingILesemodus } = useBehandlingState();
    const [modalÅpen, setModalÅpen] = useState(false);
    const [fritekstVedSubmit, setFritekstVedSubmit] = useState<string>('');

    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors },
    } = useForm<OpprettForhåndsvarselFormData>({
        resolver: zodResolver(opprettForhåndsvarselSchema),
        defaultValues: {
            fritekst: '',
        },
    });

    const visBekreftelsesmodal = (): void => {
        setFritekstVedSubmit(getValues('fritekst') ?? '');
        setModalÅpen(true);
    };

    const handleBekreft = (): void => {
        onBekreft(fritekstVedSubmit);
    };

    if (!varselbrevtekster) {
        return null;
    }

    return (
        <>
            <form
                id="opprettForm"
                onSubmit={handleSubmit(visBekreftelsesmodal)}
                className="flex flex-col gap-6"
            >
                <div className="flex-1 border border-ax-border-neutral-strong rounded-lg py-3 px-4">
                    <Heading level="2" size="small" spacing>
                        Opprett forhåndsvarsel
                    </Heading>
                    <VStack className="max-w-xl pt-4" gap="space-24">
                        <Heading level="3" size="medium">
                            {varselbrevtekster.overskrift}
                        </Heading>
                        {varselbrevtekster.avsnitter.map((avsnitt: Section) => (
                            <Fragment key={avsnitt.title}>
                                {avsnitt.title && (
                                    <Heading level="4" size="xsmall">
                                        {avsnitt.title}
                                    </Heading>
                                )}
                                <BodyLong size="small">{avsnitt.body}</BodyLong>
                                {avsnitt.title === 'Dette har skjedd' && (
                                    <Textarea
                                        {...register('fritekst')}
                                        size="small"
                                        minRows={3}
                                        label="Legg til utdypende tekst"
                                        maxLength={maksAntallTegn}
                                        error={errors.fritekst?.message}
                                        readOnly={behandlingILesemodus}
                                        resize
                                    />
                                )}
                            </Fragment>
                        ))}
                    </VStack>
                </div>
            </form>

            <BekreftelsesmodalMedState
                open={modalÅpen}
                onClose={() => setModalÅpen(false)}
                tekster={{
                    overskrift: 'Send forhåndsvarselet',
                    brødtekst:
                        'Er du sikker på at du vil sende forhåndsvarselet? Dette kan ikke angres.',
                    bekreftTekst: 'Send forhåndsvarselet',
                }}
                onBekreft={handleBekreft}
                laster={isPending}
            />
        </>
    );
};
