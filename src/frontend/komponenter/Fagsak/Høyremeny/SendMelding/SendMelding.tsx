import * as React from 'react';

import styled from 'styled-components';

import { Knapp } from 'nav-frontend-knapper';

import { FamilieSelect } from '@navikt/familie-form-elements';

import { DokumentMal, dokumentMaler } from '../../../../kodeverk';
import { Navigering, Spacer20 } from '../../../Felleskomponenter/Flytelementer';
import { FamilieTilbakeTextArea } from '../../../Felleskomponenter/Skjemaelementer';
import ForhåndsvisBrev from './ForhåndsvisBrev/ForhåndsvisBrev';
import { useSendMelding, Mottakere } from './SendMeldingContext';

const StyledContainer = styled.div`
    margin-top: 10px;
`;

const tekstfeltLabel = (mal: DokumentMal) => {
    return mal === DokumentMal.INNHENT_DOKUMENTASJON
        ? 'Liste over dokumenter (skriv ett dokument pr. linje)'
        : 'Fritekst';
};

interface IProps {
    test?: boolean;
}

const SendMelding: React.FC<IProps> = () => {
    const { maler, skjema, senderInn, sendBrev } = useSendMelding();
    const erLesevisning = false;

    const onChangeMal = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const nyMal = DokumentMal[e.target.value as keyof typeof DokumentMal];
        skjema.felter.maltype.validerOgSettFelt(nyMal);
    };

    const kanSende = skjema.felter.maltype.verdi !== '' && skjema.felter.fritekst.verdi !== '';

    return (
        <StyledContainer>
            <FamilieSelect
                id="mottaker"
                label={'Mottaker'}
                erLesevisning={true}
                value={skjema.felter.mottaker.verdi.verdi}
                lesevisningVerdi={skjema.felter.mottaker.verdi.label}
            >
                {Mottakere.map(opt => (
                    <option key={opt.verdi} value={opt.verdi}>
                        {opt.label}
                    </option>
                ))}
            </FamilieSelect>
            <Spacer20 />
            <FamilieSelect
                {...skjema.felter.maltype.hentNavInputProps(skjema.visFeilmeldinger)}
                id="dokumentMal"
                label={'Mal'}
                erLesevisning={false}
                value={skjema.felter.maltype.verdi}
                onChange={event => onChangeMal(event)}
            >
                <option value={''}>Velg brev</option>
                {maler.map(mal => (
                    <option key={mal} value={mal}>
                        {dokumentMaler[mal]}
                    </option>
                ))}
            </FamilieSelect>
            {!!skjema.felter.maltype.verdi && (
                <>
                    <Spacer20 />
                    <FamilieTilbakeTextArea
                        {...skjema.felter.fritekst.hentNavInputProps(skjema.visFeilmeldinger)}
                        label={tekstfeltLabel(skjema.felter.maltype.verdi)}
                        erLesevisning={erLesevisning}
                        value={skjema.felter.fritekst.verdi}
                        onChange={event =>
                            skjema.felter.fritekst.validerOgSettFelt(event.target.value)
                        }
                        maxLength={3000}
                    />
                </>
            )}
            <Spacer20 />
            <Navigering>
                <div>
                    <Knapp
                        type={'hoved'}
                        mini
                        disabled={!kanSende}
                        spinner={senderInn}
                        autoDisableVedSpinner
                        onClick={() => sendBrev()}
                    >
                        Send brev
                    </Knapp>
                </div>
                {kanSende && (
                    <div>
                        <ForhåndsvisBrev />
                    </div>
                )}
            </Navigering>
        </StyledContainer>
    );
};

export default SendMelding;
