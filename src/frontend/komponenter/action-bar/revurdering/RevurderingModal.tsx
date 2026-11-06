import type { FC, RefObject } from 'react';
import type { TilbakekrevingRevurderingsarsak } from '@/generated-new';

import { zodResolver } from '@hookform/resolvers/zod';
import {
    Button,
    InlineMessage,
    LocalAlert,
    Modal,
    Radio,
    RadioGroup,
    Select,
    Textarea,
    VStack,
} from '@navikt/ds-react';
import { useState } from 'react';
import { get, useForm, useWatch } from 'react-hook-form';

import { hentRevurderingsårsak } from '@/typer/revurdering';
import { MODAL_BREDDE } from '@/utils/modalUtils';

import { instansvalg, revurderingSchema } from './utils';

type Props = {
    dialogRef: RefObject<HTMLDialogElement | null>;
    heading: string;
    submitTekst: string;
    defaultValues?: TilbakekrevingRevurderingsarsak;
    isPending: boolean;
    krevEndring?: boolean;
    feilmelding?: { tittel: string; melding?: string };
    onSubmit: (data: TilbakekrevingRevurderingsarsak) => void;
    onNullstill: () => void;
};

export const RevurderingModal: FC<Props> = ({
    dialogRef,
    heading,
    submitTekst,
    defaultValues,
    isPending,
    krevEndring = false,
    feilmelding,
    onSubmit,
    onNullstill,
}: Props) => {
    const { control, register, handleSubmit, reset, formState } =
        useForm<TilbakekrevingRevurderingsarsak>({
            resolver: zodResolver(revurderingSchema),
            shouldUnregister: true,
            defaultValues,
        });
    const { isDirty } = formState;
    const [forsøktLagreUtenEndring, setForsøktLagreUtenEndring] = useState(false);
    const valgtÅrsak = useWatch({ control, name: 'revurderingsarsak' });
    const instansvalgForÅrsak = valgtÅrsak ? (instansvalg[valgtÅrsak] ?? []) : [];
    const { name: instansName, ...instansProps } = register('instans');

    return (
        <Modal
            ref={dialogRef}
            header={{ heading }}
            className={MODAL_BREDDE}
            onClose={(): void => {
                reset(defaultValues);
                setForsøktLagreUtenEndring(false);
                onNullstill();
            }}
            onBeforeClose={(): boolean => !isPending}
        >
            <form
                onSubmit={handleSubmit((data: TilbakekrevingRevurderingsarsak): void => {
                    if (krevEndring && !isDirty) {
                        setForsøktLagreUtenEndring(true);
                        return;
                    }
                    onSubmit(data);
                })}
            >
                <Modal.Body className="pt-0">
                    <VStack gap="space-16">
                        <Select
                            {...register('revurderingsarsak')}
                            label="Hva er årsaken til revurderingen?"
                            defaultValue={defaultValues?.revurderingsarsak ?? ''}
                            size="small"
                            disabled={isPending}
                            error={formState.errors.revurderingsarsak?.message}
                        >
                            <option value="" disabled>
                                Velg årsak
                            </option>
                            {Object.entries(hentRevurderingsårsak).map(([verdi, tekst]) => (
                                <option key={verdi} value={verdi}>
                                    {tekst}
                                </option>
                            ))}
                        </Select>
                        {instansvalgForÅrsak.length > 0 && (
                            <RadioGroup
                                name={instansName}
                                legend="Hvilken instans har omgjort vedtaket?"
                                size="small"
                                disabled={isPending}
                                error={get(formState.errors, 'instans.message')}
                            >
                                {instansvalgForÅrsak.map(instans => (
                                    <Radio key={instans} value={instans} {...instansProps}>
                                        {instans}
                                    </Radio>
                                ))}
                            </RadioGroup>
                        )}
                        {valgtÅrsak && (
                            <Textarea
                                {...register('begrunnelse')}
                                label="Beskriv kort årsaken til revurderingen"
                                maxLength={1000}
                                minRows={3}
                                size="small"
                                resize
                                disabled={isPending}
                                error={formState.errors.begrunnelse?.message}
                            />
                        )}
                        <div aria-live="polite">
                            {krevEndring && forsøktLagreUtenEndring && !isDirty && (
                                <InlineMessage size="small" status="warning">
                                    Ingen endringer å lagre. Endre årsak, instans eller begrunnelse
                                    før du lagrer.
                                </InlineMessage>
                            )}
                        </div>
                        {feilmelding && (
                            <LocalAlert status="error">
                                <LocalAlert.Header>
                                    <LocalAlert.Title>{feilmelding.tittel}</LocalAlert.Title>
                                </LocalAlert.Header>
                                {feilmelding.melding && (
                                    <LocalAlert.Content>{feilmelding.melding}</LocalAlert.Content>
                                )}
                            </LocalAlert>
                        )}
                    </VStack>
                </Modal.Body>
                <Modal.Footer>
                    <Button type="submit" size="small" loading={isPending} disabled={isPending}>
                        {submitTekst}
                    </Button>
                    <Button
                        type="button"
                        size="small"
                        variant="secondary"
                        disabled={isPending}
                        onClick={(): void => dialogRef.current?.close()}
                    >
                        Avbryt
                    </Button>
                </Modal.Footer>
            </form>
        </Modal>
    );
};
