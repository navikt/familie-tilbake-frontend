import * as React from 'react';

import styled from 'styled-components';

import Lenke from 'nav-frontend-lenker';
import { Undertekst } from 'nav-frontend-typografi';

import { AddCircle } from '@navikt/ds-icons';

import { validerTekstMaksLengde } from '../../../utils';
import { Spacer8 } from '../../Felleskomponenter/Flytelementer';
import { FamilieTilbakeTextArea } from '../../Felleskomponenter/Skjemaelementer';
import { useFeilutbetalingVedtak } from './FeilutbetalingVedtakContext';
import { UnderavsnittSkjemaData } from './typer/feilutbetalingVedtak';

const StyledUndertekst = styled(Undertekst)`
    display: inline-block;
    margin-left: 1ex;
`;
interface IProps {
    avsnittIndex: string;
    underavsnitt: UnderavsnittSkjemaData;
    maximumLength?: number;
    erLesevisning: boolean;
}

const VedtakFritekstSkjema: React.FC<IProps> = ({
    avsnittIndex,
    underavsnitt,
    maximumLength,
    erLesevisning,
}) => {
    const [isTextfieldHidden, hideTextField] = React.useState<boolean>();
    const { oppdaterUnderavsnitt } = useFeilutbetalingVedtak();

    React.useEffect(() => {
        hideTextField(!underavsnitt.fritekst && !underavsnitt.fritekstPåkrevet);
    }, [underavsnitt]);

    const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const maxLength = maximumLength ? maximumLength : 4000;
        const nyVerdi = e.target.value;
        const feilmelding = validerTekstMaksLengde(maxLength)(nyVerdi);
        oppdaterUnderavsnitt(avsnittIndex, {
            ...underavsnitt,
            fritekst: nyVerdi,
            harFeil: !!feilmelding,
            feilmelding: feilmelding || undefined,
        });
    };

    return (
        <>
            {isTextfieldHidden && !erLesevisning && (
                <>
                    <Spacer8 />
                    <Lenke
                        role="button"
                        data-testid={`legg-til-fritekst-${avsnittIndex}-${underavsnitt.index}`}
                        onClick={e => {
                            e.preventDefault();
                            hideTextField(false);
                        }}
                        onKeyUp={e => {
                            const key = e.code || e.keyCode;
                            if (key === 'Space' || key === 'Enter' || key === 32 || key === 13) {
                                hideTextField(false);
                            }
                        }}
                        href="#"
                    >
                        <AddCircle aria-label="Legg til utdypende tekst" />
                        <StyledUndertekst>Legg til utdypende tekst</StyledUndertekst>
                    </Lenke>
                </>
            )}
            {!isTextfieldHidden && (
                <>
                    <Spacer8 />
                    <FamilieTilbakeTextArea
                        name={'fritekst'}
                        data-testid={`fritekst-${avsnittIndex}-${underavsnitt.index}`}
                        label={!erLesevisning ? 'Utdypende tekst' : undefined}
                        erLesevisning={erLesevisning}
                        tekstLesevisning={underavsnitt.fritekst || 'Fritekst ikke utfylt'}
                        className={
                            erLesevisning && !underavsnitt.fritekst ? 'lesevisning_ikke_utfylt' : ''
                        }
                        maxLength={maximumLength ? maximumLength : 4000}
                        minLength={3}
                        value={underavsnitt.fritekst ? underavsnitt.fritekst : ''}
                        onChange={event => onChange(event)}
                        feil={underavsnitt.harFeil ? underavsnitt.feilmelding : null}
                    />
                    <Spacer8 />
                </>
            )}
        </>
    );
};

export default VedtakFritekstSkjema;
