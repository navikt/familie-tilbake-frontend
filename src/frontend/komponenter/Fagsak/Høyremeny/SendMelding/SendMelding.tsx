import type { FagsakDto } from '../../../../generated';
import type { Behandling } from '../../../../typer/behandling';

import { Button, ErrorMessage, Heading, Select, Textarea } from '@navikt/ds-react';
import * as React from 'react';

import ForhåndsvisBrev from './ForhåndsvisBrev/ForhåndsvisBrev';
import { useSendMelding } from './SendMeldingContext';
import { useBehandling } from '../../../../context/BehandlingContext';
import { DokumentMal, dokumentMaler } from '../../../../kodeverk';
import { målform } from '../../../../typer/målform';
import { Navigering } from '../../../Felleskomponenter/Flytelementer';
import BrevmottakerListe from '../../../Felleskomponenter/Hendelsesoversikt/BrevModul/BrevmottakerListe';
import { LabelMedSpråk } from '../../../Felleskomponenter/Skjemaelementer/LabelMedSpråk';

const tekstfeltLabel = (mal: DokumentMal): string => {
    return mal === DokumentMal.InnhentDokumentasjon
        ? 'Liste over dokumenter (skriv ett dokument pr. linje)'
        : 'Fritekst';
};

type Props = {
    fagsak: FagsakDto;
    behandling: Behandling;
};

const SendMelding: React.FC<Props> = ({ fagsak, behandling }) => {
    const { maler, skjema, senderInn, sendBrev, feilmelding } = useSendMelding();
    const { behandlingILesemodus } = useBehandling();
    const erLesevisning = !!behandlingILesemodus;

    const onChangeMal = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const nyMal = e.target.value as DokumentMal;
        skjema.felter.maltype.validerOgSettFelt(nyMal);
    };

    const kanSende = skjema.felter.maltype.verdi !== '' && skjema.felter.fritekst.verdi !== '';

    return (
        <>
            <Heading size="small" level="2">
                Send brev
            </Heading>

            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-stable">
                <Heading size="xsmall" level="3">
                    {behandling.manuelleBrevmottakere.length > 0 ? 'Brevmottakere' : 'Brevmottaker'}
                </Heading>
                <div className="gap-5 flex flex-col">
                    <BrevmottakerListe
                        brevmottakere={behandling.manuelleBrevmottakere.map(
                            ({ brevmottaker }) => brevmottaker
                        )}
                        institusjon={fagsak.institusjon}
                        bruker={fagsak.bruker}
                    />

                    <Select
                        {...skjema.felter.maltype.hentNavInputProps(skjema.visFeilmeldinger)}
                        id="dokumentMal"
                        label="Mal"
                        readOnly={erLesevisning}
                        value={skjema.felter.maltype.verdi}
                        onChange={event => onChangeMal(event)}
                    >
                        <option disabled value="">
                            Velg brev
                        </option>
                        {maler.map(mal => (
                            <option key={mal} value={mal}>
                                {dokumentMaler[mal]}
                            </option>
                        ))}
                    </Select>
                    {!!skjema.felter.maltype.verdi && (
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
                    )}
                    <Navigering>
                        <Button
                            size="small"
                            onClick={() => sendBrev()}
                            loading={senderInn}
                            disabled={!kanSende}
                        >
                            Send brev
                        </Button>
                        {kanSende && <ForhåndsvisBrev />}
                    </Navigering>
                    {feilmelding && <ErrorMessage size="small">{feilmelding}</ErrorMessage>}
                </div>
            </div>
        </>
    );
};

export default SendMelding;
