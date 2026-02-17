import type { UnderavsnittSkjemaData } from './typer/vedtak';

import { PlusCircleIcon } from '@navikt/aksel-icons';
import { BodyShort, Link, Textarea, VStack } from '@navikt/ds-react';
import * as React from 'react';

import { useVedtak } from './VedtakContext';
import { useBehandlingState } from '../../../context/BehandlingStateContext';
import { harVerdi, isEmpty, validerTekstMaksLengde } from '../../../utils';

type Props = {
    avsnittIndex: string;
    underavsnitt: UnderavsnittSkjemaData;
    maximumLength?: number;
};

export const VedtakFritekstSkjema: React.FC<Props> = ({
    avsnittIndex,
    underavsnitt,
    maximumLength = 4000,
}) => {
    const { oppdaterUnderavsnitt } = useVedtak();
    const { behandlingILesemodus, settIkkePersistertKomponent } = useBehandlingState();
    const { fritekst, fritekstPåkrevet, index, harFeil, feilmelding } = underavsnitt;
    const [fritekstfeltErSynlig, settFritekstfeltErSynlig] = React.useState<boolean>();

    React.useEffect(() => {
        settFritekstfeltErSynlig(harVerdi(fritekst) || fritekstPåkrevet);
    }, [fritekst, fritekstPåkrevet]);

    const lenkeKnappErSynlig = !fritekstfeltErSynlig && !behandlingILesemodus;

    const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        const nyVerdi = e.target.value;
        const feilmelding =
            isEmpty(nyVerdi) && !fritekstPåkrevet
                ? undefined
                : validerTekstMaksLengde(maximumLength)(nyVerdi);
        settIkkePersistertKomponent('vedtak');
        oppdaterUnderavsnitt(avsnittIndex, {
            ...underavsnitt,
            fritekst: nyVerdi,
            harFeil: !!feilmelding,
            feilmelding: feilmelding || undefined,
        });
    };

    return (
        <VStack gap="space-8">
            {lenkeKnappErSynlig && (
                <Link
                    role="button"
                    data-testid={`legg-til-fritekst-${avsnittIndex}-${index}`}
                    onClick={e => {
                        e.preventDefault();
                        settFritekstfeltErSynlig(true);
                    }}
                    onKeyUp={e => {
                        const key = e.code || e.keyCode;
                        if (key === 'Space' || key === 'Enter' || key === 32 || key === 13) {
                            settFritekstfeltErSynlig(true);
                        }
                    }}
                    href="#"
                    className="flex flex-row gap-1"
                >
                    <PlusCircleIcon aria-label="Legg til utdypende tekst" />
                    <BodyShort size="small">Legg til utdypende tekst</BodyShort>
                </Link>
            )}
            {fritekstfeltErSynlig && (
                <Textarea
                    name="fritekst"
                    data-testid={`fritekst-${avsnittIndex}-${index}`}
                    label={!behandlingILesemodus ? 'Utdypende tekst' : undefined}
                    readOnly={behandlingILesemodus}
                    maxLength={maximumLength}
                    minLength={3}
                    value={fritekst ? fritekst : ''}
                    onChange={event => onChange(event)}
                    error={harFeil ? feilmelding : null}
                />
            )}
        </VStack>
    );
};
