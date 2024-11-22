import * as React from 'react';

import { BodyShort, Button, Fieldset, Heading, Select, Textarea } from '@navikt/ds-react';

import ForhåndsvisBrev from './ForhåndsvisBrev/ForhåndsvisBrev';
import { useSendMelding } from './SendMeldingContext';
import { useBehandling } from '../../../../context/BehandlingContext';
import { DokumentMal, dokumentMaler } from '../../../../kodeverk';
import { IBehandling } from '../../../../typer/behandling';
import { IFagsak, målform } from '../../../../typer/fagsak';
import { Navigering, Spacer20 } from '../../../Felleskomponenter/Flytelementer';
import BrevmottakerListe from '../../../Felleskomponenter/Hendelsesoversikt/BrevModul/BrevmottakerListe';
import { LabelMedSpråk } from '../../../Felleskomponenter/Skjemaelementer';

const tekstfeltLabel = (mal: DokumentMal) => {
    return mal === DokumentMal.INNHENT_DOKUMENTASJON
        ? 'Liste over dokumenter (skriv ett dokument pr. linje)'
        : 'Fritekst';
};

interface IProps {
    fagsak: IFagsak;
    behandling: IBehandling;
}

const SendMelding: React.FC<IProps> = ({ fagsak, behandling }) => {
    const { maler, skjema, senderInn, sendBrev, feilmelding } = useSendMelding();
    const { behandlingILesemodus } = useBehandling();
    const erLesevisning = !!behandlingILesemodus;

    const onChangeMal = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const nyMal = DokumentMal[e.target.value as keyof typeof DokumentMal];
        skjema.felter.maltype.validerOgSettFelt(nyMal);
    };

    const kanSende = skjema.felter.maltype.verdi !== '' && skjema.felter.fritekst.verdi !== '';

    return (
        <Fieldset error={feilmelding} legend={'Send brev'} hideLegend>
            {behandling.manuelleBrevmottakere.length ? (
                <>
                    <Heading size="xsmall" spacing>
                        Brev sendes til:
                    </Heading>
                    <BrevmottakerListe
                        brevmottakere={behandling.manuelleBrevmottakere.map(
                            brevmottakerDto => brevmottakerDto.brevmottaker
                        )}
                        institusjon={fagsak?.institusjon}
                        bruker={fagsak.bruker}
                        harMargin={false}
                    />
                </>
            ) : (
                <div>
                    <Heading size="xsmall">Mottaker</Heading>
                    <BodyShort>Søker</BodyShort>
                </div>
            )}
            <Spacer20 />
            <Select
                {...skjema.felter.maltype.hentNavInputProps(skjema.visFeilmeldinger)}
                id="dokumentMal"
                label={'Mal'}
                readOnly={erLesevisning}
                value={skjema.felter.maltype.verdi}
                onChange={event => onChangeMal(event)}
            >
                <option disabled={true} value={''}>
                    Velg brev
                </option>
                {maler.map(mal => (
                    <option key={mal} value={mal}>
                        {dokumentMaler[mal]}
                    </option>
                ))}
            </Select>
            {!!skjema.felter.maltype.verdi && (
                <>
                    <Spacer20 />
                    <Textarea
                        {...skjema.felter.fritekst.hentNavInputProps(skjema.visFeilmeldinger)}
                        label={
                            <LabelMedSpråk
                                label={tekstfeltLabel(skjema.felter.maltype.verdi)}
                                språk={målform[fagsak.språkkode]}
                            />
                        }
                        aria-label={tekstfeltLabel(skjema.felter.maltype.verdi)}
                        readOnly={erLesevisning}
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
                <Button
                    size="small"
                    variant="primary"
                    onClick={() => sendBrev()}
                    loading={senderInn}
                    disabled={!kanSende}
                >
                    Send brev
                </Button>
                {kanSende && <ForhåndsvisBrev />}
            </Navigering>
        </Fieldset>
    );
};

export default SendMelding;
