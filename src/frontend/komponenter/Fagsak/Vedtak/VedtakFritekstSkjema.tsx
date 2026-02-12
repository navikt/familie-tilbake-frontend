import type { UnderavsnittSkjemaData } from './typer/vedtak';

import { PlusCircleIcon } from '@navikt/aksel-icons';
import { BodyShort, Link, Textarea } from '@navikt/ds-react';
import * as React from 'react';
import { styled } from 'styled-components';

import { useVedtak } from './VedtakContext';
import { useBehandlingState } from '../../../context/BehandlingStateContext';
import { harVerdi, isEmpty, validerTekstMaksLengde } from '../../../utils';
import { Spacer8 } from '../../Felleskomponenter/Flytelementer';

const StyledUndertekst = styled(BodyShort)`
    display: inline-block;
    margin-left: 1ex;
`;
type Props = {
    avsnittIndex: string;
    underavsnitt: UnderavsnittSkjemaData;
    maximumLength?: number;
    erLesevisning: boolean;
};

export const VedtakFritekstSkjema: React.FC<Props> = ({
    avsnittIndex,
    underavsnitt,
    maximumLength,
    erLesevisning,
}) => {
    const { oppdaterUnderavsnitt } = useVedtak();
    const { settIkkePersistertKomponent } = useBehandlingState();
    const { fritekst, fritekstPåkrevet, index, harFeil, feilmelding } = underavsnitt;
    const [fritekstfeltErSynlig, settFritekstfeltErSynlig] = React.useState<boolean>();

    React.useEffect(() => {
        settFritekstfeltErSynlig(harVerdi(fritekst) || fritekstPåkrevet);
    }, [fritekst, fritekstPåkrevet]);

    const lenkeKnappErSynlig = !fritekstfeltErSynlig && !erLesevisning;

    const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        const maxLength = maximumLength ? maximumLength : 4000;
        const nyVerdi = e.target.value;
        const feilmelding =
            isEmpty(nyVerdi) && !fritekstPåkrevet
                ? undefined
                : validerTekstMaksLengde(maxLength)(nyVerdi);
        settIkkePersistertKomponent('vedtak');
        oppdaterUnderavsnitt(avsnittIndex, {
            ...underavsnitt,
            fritekst: nyVerdi,
            harFeil: !!feilmelding,
            feilmelding: feilmelding || undefined,
        });
    };

    return (
        <>
            {lenkeKnappErSynlig && (
                <>
                    <Spacer8 />
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
                    >
                        <PlusCircleIcon aria-label="Legg til utdypende tekst" />
                        <StyledUndertekst size="small">Legg til utdypende tekst</StyledUndertekst>
                    </Link>
                </>
            )}
            {fritekstfeltErSynlig && (
                <>
                    <Spacer8 />
                    <Textarea
                        name="fritekst"
                        data-testid={`fritekst-${avsnittIndex}-${index}`}
                        label={!erLesevisning ? 'Utdypende tekst' : undefined}
                        readOnly={erLesevisning}
                        maxLength={maximumLength ? maximumLength : 4000}
                        minLength={3}
                        value={fritekst ? fritekst : ''}
                        onChange={event => onChange(event)}
                        error={harFeil ? feilmelding : null}
                    />
                    <Spacer8 />
                </>
            )}
        </>
    );
};
