import type { VedtaksbrevFormData } from './schema';
import type { TextareaProps } from '@navikt/ds-react';
import type { FC } from 'react';
import type { FieldErrors, FieldPath, SubmitHandler } from 'react-hook-form';
import type { Avsnitt, PakrevdBegrunnelse, RotElement, VedtaksbrevData } from '~/generated-new';

import { Textarea } from '@navikt/ds-react';
import { useState } from 'react';
import { get, useFormContext, useWatch } from 'react-hook-form';

import { useBehandlingState } from '~/context/BehandlingStateContext';

import { elementArrayTilTekst, tekstTilElementArray } from './utils';
import { VEDTAKSBREV_FORM_ID } from './Vedtaksbrev';

const hentFeilmelding = (
    errors: FieldErrors<VedtaksbrevFormData>,
    name: string
): string | undefined => {
    const fieldError = get(errors, name);
    if (!fieldError) return undefined;
    return fieldError.root?.message ?? fieldError.message;
};

type Props = {
    vedtaksbrevData: VedtaksbrevData;
    onSubmit: SubmitHandler<VedtaksbrevFormData>;
};

export const VedtaksbrevSkjema: FC<Props> = ({ vedtaksbrevData, onSubmit }) => {
    const { handleSubmit } = useFormContext<VedtaksbrevFormData>();

    return (
        <form id={VEDTAKSBREV_FORM_ID} onSubmit={handleSubmit(onSubmit)} className="contents">
            <ElementTextarea
                name="hovedavsnitt.underavsnitt"
                description={vedtaksbrevData.hovedavsnitt.forklaring}
                label={vedtaksbrevData.hovedavsnitt.tittel}
            />
            {vedtaksbrevData.avsnitt.map((avsnitt, index) => (
                <Avsnitt key={avsnitt.id} avsnitt={avsnitt} avsnittIndex={index} />
            ))}
        </form>
    );
};

const Avsnitt: FC<{
    avsnitt: Avsnitt;
    avsnittIndex: number;
}> = ({ avsnitt, avsnittIndex }) => {
    const { behandlingILesemodus } = useBehandlingState();
    const {
        setValue,
        formState: { errors, isSubmitted },
    } = useFormContext<VedtaksbrevFormData>();
    const name = `avsnitt.${avsnittIndex}.underavsnitt` satisfies FieldPath<VedtaksbrevFormData>;
    const elementValue = useWatch<VedtaksbrevFormData>({ name }) as RotElement[];
    const [localText, setLocalText] = useState(() => elementArrayTilTekst(elementValue));

    const opprinneligePåkrevdeBegrunnelser = avsnitt.underavsnitt.filter(
        (el): el is PakrevdBegrunnelse & { type: 'påkrevd_begrunnelse' } =>
            el.type === 'påkrevd_begrunnelse'
    );

    return (
        <>
            <Textarea
                name={name}
                label={avsnitt.tittel}
                description={avsnitt.forklaring}
                value={localText}
                error={hentFeilmelding(errors, name)}
                onChange={e => {
                    setLocalText(e.target.value);
                    const nyeRentekst = tekstTilElementArray(e.target.value);
                    const andreElementer = elementValue.filter(({ type }) => type !== 'rentekst');
                    setValue(name, [...nyeRentekst, ...andreElementer], {
                        shouldDirty: true,
                        shouldValidate: isSubmitted,
                    });
                }}
                size="small"
                maxLength={3000}
                minRows={3}
                resize
                readOnly={behandlingILesemodus}
            />

            {elementValue.map((element, elementIndex) => {
                if (element.type !== 'påkrevd_begrunnelse') return null;
                const opprinnelig = opprinneligePåkrevdeBegrunnelser.find(
                    el => el.begrunnelseType === element.begrunnelseType
                );
                return (
                    <ElementTextarea
                        key={element.begrunnelseType}
                        name={`avsnitt.${avsnittIndex}.underavsnitt.${elementIndex}.underavsnitt`}
                        label={opprinnelig?.tittel ?? ''}
                        description={opprinnelig?.forklaring}
                    />
                );
            })}
        </>
    );
};

const ElementTextarea: FC<
    Omit<TextareaProps, 'onChange' | 'value'> & {
        name: FieldPath<VedtaksbrevFormData>;
    }
> = ({ name, ...props }) => {
    const { behandlingILesemodus } = useBehandlingState();
    const {
        register,
        setValue,
        formState: { errors, isSubmitted },
    } = useFormContext<VedtaksbrevFormData>();
    const { ref } = register(name);
    const elementValue = useWatch<VedtaksbrevFormData>({ name }) as RotElement[];
    const [localText, setLocalText] = useState(() => elementArrayTilTekst(elementValue));

    return (
        <Textarea
            {...props}
            ref={ref}
            name={name}
            value={localText}
            error={hentFeilmelding(errors, name)}
            onChange={e => {
                setLocalText(e.target.value);
                setValue(name, tekstTilElementArray(e.target.value), {
                    shouldDirty: true,
                    shouldValidate: isSubmitted,
                });
            }}
            size="small"
            maxLength={3000}
            minRows={3}
            resize
            readOnly={behandlingILesemodus}
        />
    );
};
