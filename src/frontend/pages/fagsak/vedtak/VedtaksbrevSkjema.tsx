import type { VedtaksbrevFormData } from './schema';
import type { TextareaProps } from '@navikt/ds-react';
import type { FC } from 'react';
import type { FieldPath, SubmitHandler } from 'react-hook-form';
import type { Avsnitt, PakrevdBegrunnelse, VedtaksbrevData } from '~/generated-new';

import { Textarea } from '@navikt/ds-react';
import { get, useFormContext } from 'react-hook-form';

import { useBehandlingState } from '~/context/BehandlingStateContext';

import { VEDTAKSBREV_FORM_ID } from './Vedtaksbrev';

type Props = {
    vedtaksbrevData: VedtaksbrevData;
    onSubmit: SubmitHandler<VedtaksbrevFormData>;
};

export const VedtaksbrevSkjema: FC<Props> = ({ vedtaksbrevData, onSubmit }) => {
    const { handleSubmit } = useFormContext<VedtaksbrevFormData>();

    return (
        <form id={VEDTAKSBREV_FORM_ID} onSubmit={handleSubmit(onSubmit)} className="contents">
            <TekstFelt
                name="hovedavsnitt.tekst"
                label={vedtaksbrevData.hovedavsnitt.tittel}
                description={vedtaksbrevData.hovedavsnitt.forklaring}
            />
            {vedtaksbrevData.avsnitt.map((avsnitt, index) => (
                <AvsnittFelter key={avsnitt.id} avsnitt={avsnitt} avsnittIndex={index} />
            ))}
        </form>
    );
};

const AvsnittFelter: FC<{ avsnitt: Avsnitt; avsnittIndex: number }> = ({
    avsnitt,
    avsnittIndex,
}) => {
    const påkrevdeBegrunnelser = avsnitt.underavsnitt.filter(
        (el): el is PakrevdBegrunnelse & { type: 'påkrevd_begrunnelse' } =>
            el.type === 'påkrevd_begrunnelse'
    );

    return (
        <>
            <TekstFelt
                name={`avsnitt.${avsnittIndex}.tekst`}
                label={avsnitt.tittel}
                description={avsnitt.forklaring}
            />
            {påkrevdeBegrunnelser.map((begrunnelse, begrunnelseIndex) => (
                <TekstFelt
                    key={begrunnelse.begrunnelseType}
                    name={`avsnitt.${avsnittIndex}.påkrevdeBegrunnelser.${begrunnelseIndex}.tekst`}
                    label={begrunnelse.tittel}
                    description={begrunnelse.forklaring}
                />
            ))}
        </>
    );
};

type TekstFeltProps = Omit<TextareaProps, 'error' | 'name' | 'ref' | 'value'> & {
    name: FieldPath<VedtaksbrevFormData>;
};

const TekstFelt: FC<TekstFeltProps> = ({ name, ...props }) => {
    const { behandlingILesemodus } = useBehandlingState();
    const {
        register,
        formState: { errors },
    } = useFormContext<VedtaksbrevFormData>();
    const feilmelding = get(errors, name)?.message;

    return (
        <Textarea
            {...props}
            {...register(name)}
            error={feilmelding}
            size="small"
            maxLength={3000}
            minRows={3}
            resize
            readOnly={behandlingILesemodus}
        />
    );
};
