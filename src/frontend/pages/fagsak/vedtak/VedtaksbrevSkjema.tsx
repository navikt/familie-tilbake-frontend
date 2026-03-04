import type { VedtaksbrevFormData } from './schema';
import type { TextareaProps } from '@navikt/ds-react';
import type { FC } from 'react';
import type { FieldPath } from 'react-hook-form';
import type { RotElement } from '~/generated-new';

import { Textarea } from '@navikt/ds-react';
import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { elementArrayTilTekst, tekstTilElementArray } from './utils';

export const VedtaksbrevSkjema: FC = () => {
    const methods = useFormContext<VedtaksbrevFormData>();
    return (
        <>
            <ElementTextarea
                name="hovedavsnitt.underavsnitt"
                description={methods.getValues('hovedavsnitt').forklaring}
                label={methods.getValues('hovedavsnitt').tittel}
            />
            {methods.getValues('avsnitt').map((avsnitt, index) => (
                <Avsnitt key={avsnitt.id} avsnitt={avsnitt} avsnittIndex={index} />
            ))}
        </>
    );
};

const Avsnitt: FC<{
    avsnitt: VedtaksbrevFormData['avsnitt'][number];
    avsnittIndex: number;
}> = ({ avsnitt, avsnittIndex }) => {
    const name = `avsnitt.${avsnittIndex}.underavsnitt` satisfies FieldPath<VedtaksbrevFormData>;
    const { setValue } = useFormContext<VedtaksbrevFormData>();
    const elementValue = useWatch<VedtaksbrevFormData>({ name }) as RotElement[];
    const [localText, setLocalText] = useState(() => elementArrayTilTekst(elementValue));

    return (
        <>
            <Textarea
                name={name}
                label={avsnitt.tittel}
                description={avsnitt.forklaring}
                value={localText}
                onChange={e => {
                    setLocalText(e.target.value);
                    const nyeRentekst = tekstTilElementArray(e.target.value);
                    const andreElementer = elementValue.filter(({ type }) => type !== 'rentekst');
                    setValue(name, [...nyeRentekst, ...andreElementer]);
                }}
                size="small"
                maxLength={3000}
                minRows={3}
                resize
            />

            {avsnitt.underavsnitt.map((element, elementIndex) => {
                if (element.type !== 'påkrevd_begrunnelse') return null;
                return (
                    <ElementTextarea
                        key={element.tittel}
                        name={`avsnitt.${avsnittIndex}.underavsnitt.${elementIndex}.underavsnitt`}
                        label={element.tittel}
                        description={element.forklaring}
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
    const { setValue } = useFormContext<VedtaksbrevFormData>();
    const elementValue = useWatch<VedtaksbrevFormData>({ name }) as RotElement[];
    const [localText, setLocalText] = useState(() => elementArrayTilTekst(elementValue));

    return (
        <Textarea
            {...props}
            name={name}
            value={localText}
            onChange={e => {
                setLocalText(e.target.value);
                setValue(name, tekstTilElementArray(e.target.value));
            }}
            size="small"
            maxLength={3000}
            minRows={3}
            resize
        />
    );
};
