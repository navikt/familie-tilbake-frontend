import * as React from 'react';

import styled from 'styled-components';

import { Undertekst } from 'nav-frontend-typografi';

import { Spacer8 } from '../../Felleskomponenter/Flytelementer';
import { FamilieTilbakeTextArea } from '../../Felleskomponenter/Skjemaelementer';
import { AddCircleIkon } from '../../Felleskomponenter/Ikoner';
import { VedtaksbrevUnderavsnitt } from '../../../typer/vedtakTyper';

const LeggTilFritekst = styled.div`
    cursor: pointer;
`;

const StyledUndertekst = styled(Undertekst)`
    display: inline-block;
    vertical-align: top;
    margin-left: 1ex;
`;

interface IProps {
    underavsnitt: VedtaksbrevUnderavsnitt;
    maximumLength?: number;
    erLesevisning: boolean;
}

const VedtakFritekstSkjema: React.FC<IProps> = ({ underavsnitt, maximumLength, erLesevisning }) => {
    const [isTextfieldHidden, hideTextField] = React.useState<boolean>();
    const [fritekst, settFritekst] = React.useState<string>();

    React.useEffect(() => {
        hideTextField(!underavsnitt.fritekst && !underavsnitt.fritekstPåkrevet);
        settFritekst(underavsnitt.fritekst ? underavsnitt.fritekst : '');
    }, [underavsnitt]);

    const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const nyVerdi = e.target.value;
        settFritekst(nyVerdi);
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
                        label={'Utdypende tekst'}
                        erLesevisning={erLesevisning}
                        maxLength={maximumLength ? maximumLength : 4000}
                        value={fritekst ? fritekst : ''}
                        onChange={event => onChange(event)}
                    />
                </>
            )}
        </>
    );
};

export default VedtakFritekstSkjema;
