import type { VedtaksbrevFormData } from './schema';
import type { TextareaProps } from '@navikt/ds-react';
import type { FC } from 'react';
import type { FieldPath } from 'react-hook-form';
import type { Avsnitt, RotElement, VedtaksbrevData } from '~/generated-new';

import { Textarea } from '@navikt/ds-react';
import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { useBehandlingState } from '~/context/BehandlingStateContext';

import { elementArrayTilTekst, tekstTilElementArray } from './utils';

type Props = {
    vedtaksbrevData: VedtaksbrevData;
};

export const VedtaksbrevSkjema: FC<Props> = ({ vedtaksbrevData }) => {
    return (
        <>
            <ElementTextarea
                name="hovedavsnitt.underavsnitt"
                description={vedtaksbrevData.hovedavsnitt.forklaring}
                label={vedtaksbrevData.hovedavsnitt.tittel}
            />
            {vedtaksbrevData.avsnitt.map((avsnitt, index) => (
                <Avsnitt key={avsnitt.id} avsnitt={avsnitt} avsnittIndex={index} />
            ))}
        </>
    );
};

const Avsnitt: FC<{
    avsnitt: Avsnitt;
    avsnittIndex: number;
}> = ({ avsnitt, avsnittIndex }) => {
    const { behandlingILesemodus } = useBehandlingState();
    const { setValue } = useFormContext<VedtaksbrevFormData>();
    const name = `avsnitt.${avsnittIndex}.underavsnitt` satisfies FieldPath<VedtaksbrevFormData>;
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
                    setValue(name, [...nyeRentekst, ...andreElementer], { shouldDirty: true });
                }}
                size="small"
                maxLength={3000}
                minRows={3}
                resize
                readOnly={behandlingILesemodus}
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
    const { behandlingILesemodus } = useBehandlingState();
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
                setValue(name, tekstTilElementArray(e.target.value), { shouldDirty: true });
            }}
            size="small"
            maxLength={3000}
            minRows={3}
            resize
            readOnly={behandlingILesemodus}
        />
    );
};
