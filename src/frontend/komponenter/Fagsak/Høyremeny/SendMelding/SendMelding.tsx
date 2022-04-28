import * as React from 'react';

import styled from 'styled-components';

import { FamilieSelect } from '@navikt/familie-form-elements';

import { useBehandling } from '../../../../context/BehandlingContext';
import { DokumentMal, dokumentMaler } from '../../../../kodeverk';
import { IFagsak, målform } from '../../../../typer/fagsak';
import { FTButton, Navigering, Spacer20 } from '../../../Felleskomponenter/Flytelementer';
import { FamilieTilbakeTextArea, LabelMedSpråk } from '../../../Felleskomponenter/Skjemaelementer';
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
    fagsak: IFagsak;
}

const SendMelding: React.FC<IProps> = ({ fagsak }) => {
    const { maler, skjema, senderInn, sendBrev } = useSendMelding();
    const { behandlingILesemodus } = useBehandling();
    const erLesevisning = !!behandlingILesemodus;

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
                erLesevisning={erLesevisning}
                value={skjema.felter.maltype.verdi}
                onChange={event => onChangeMal(event)}
                lesevisningVerdi={'Velg brev'}
            >
                <option disabled={true} value={''}>
                    Velg brev
                </option>
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
                        label={
                            <LabelMedSpråk
                                label={tekstfeltLabel(skjema.felter.maltype.verdi)}
                                språk={målform[fagsak.språkkode]}
                            />
                        }
                        aria-label={tekstfeltLabel(skjema.felter.maltype.verdi)}
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
                    <FTButton
                        size="small"
                        variant="primary"
                        onClick={() => sendBrev()}
                        loading={senderInn}
                        disabled={!kanSende}
                    >
                        Send brev
                    </FTButton>
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
