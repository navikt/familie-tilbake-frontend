import * as React from 'react';

import styled from 'styled-components';

import { Undertekst } from 'nav-frontend-typografi';

import { Spacer8 } from '../../Felleskomponenter/Flytelementer';
import { AddCircleIkon } from '../../Felleskomponenter/Ikoner';
import { FamilieTilbakeTextArea } from '../../Felleskomponenter/Skjemaelementer';
import { useFeilutbetalingVedtak } from './FeilutbetalingVedtakContext';
import { UnderavsnittSkjemaData } from './typer/feilutbetalingVedtak';

const LeggTilFritekst = styled.div`
    cursor: pointer;
`;

const StyledUndertekst = styled(Undertekst)`
    display: inline-block;
    vertical-align: top;
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
        const nyVerdi = e.target.value;
        oppdaterUnderavsnitt(avsnittIndex, {
            ...underavsnitt,
            fritekst: nyVerdi,
        });
    };

    return (
        <>
            {isTextfieldHidden && !erLesevisning && (
                <>
                    <Spacer8 />
                    <LeggTilFritekst
                        role="button"
                        onClick={e => {
                            e.preventDefault();
                            hideTextField(false);
                        }}
                        onKeyDown={e => {
                            e.preventDefault();
                            hideTextField(false);
                        }}
                    >
                        <AddCircleIkon />
                        <StyledUndertekst>Legg til utdypende tekst</StyledUndertekst>
                    </LeggTilFritekst>
                </>
            )}
            {!isTextfieldHidden && (
                <>
                    <Spacer8 />
                    <FamilieTilbakeTextArea
                        name={'fritekst'}
                        label={!erLesevisning ? 'Utdypende tekst' : undefined}
                        erLesevisning={erLesevisning}
                        tekstLesevisning={underavsnitt.fritekst || 'Fritekst ikke utfylt'}
                        className={
                            erLesevisning && !underavsnitt.fritekst ? 'lesevisning_ikke_utfylt' : ''
                        }
                        maxLength={maximumLength ? maximumLength : 4000}
                        value={underavsnitt.fritekst ? underavsnitt.fritekst : ''}
                        onChange={event => onChange(event)}
                    />
                </>
            )}
        </>
    );
};

export default VedtakFritekstSkjema;
