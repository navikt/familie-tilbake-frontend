import type { FrontendBrukerDto, InstitusjonDto } from '../../../../generated';
import type { Brevmottaker } from '../../../../typer/Brevmottaker';

import React from 'react';

import { MottakerType } from '../../../../typer/Brevmottaker';
import { formaterIdent, lagPersonLabel } from '../../../../utils/formatter';

type Props = {
    bruker: FrontendBrukerDto;
    institusjon: InstitusjonDto | undefined;
    brevmottakere: Brevmottaker[];
};

const BrevmottakerListe: React.FC<Props> = ({ bruker, institusjon, brevmottakere }) => {
    const skalViseInstitusjon = !!institusjon;
    const harUtenlandskAdresse = brevmottakere.some(
        mottaker => mottaker.type === MottakerType.BrukerMedUtenlandskAdresse
    );
    const harFullmektig = brevmottakere.some(mottaker => mottaker.type === MottakerType.Fullmektig);
    const harVerge = brevmottakere.some(mottaker => mottaker.type === MottakerType.Verge);
    const harManuellDødsboadresse = brevmottakere.some(
        mottaker => mottaker.type === MottakerType.Dødsbo
    );

    const skalViseSøker =
        bruker && !institusjon && !harManuellDødsboadresse && !harUtenlandskAdresse;

    return (
        <ul>
            {skalViseSøker && (
                <li key="søker">{lagPersonLabel(bruker.personIdent || '', bruker)}</li>
            )}
            {skalViseInstitusjon && (
                <li key="institusjon">{`Institusjon | ${
                    institusjon.navn?.concat(' |') || ''
                } ${formaterIdent(institusjon.organisasjonsnummer)}`}</li>
            )}
            {harUtenlandskAdresse &&
                brevmottakere
                    .filter(mottaker => mottaker.type === MottakerType.BrukerMedUtenlandskAdresse)
                    .map((mottaker, index) => (
                        <li key={`utenlandsk-adresse-${index}`}>
                            {mottaker.navn} | Utenlandsk adresse
                        </li>
                    ))}
            {harManuellDødsboadresse &&
                brevmottakere
                    .filter(mottaker => mottaker.type === MottakerType.Dødsbo)
                    .map((mottaker, index) => (
                        <li key={`doedsbo-${index}`}>{mottaker.navn} | Dødsbo</li>
                    ))}
            {harFullmektig &&
                brevmottakere
                    .filter(mottaker => mottaker.type === MottakerType.Fullmektig)
                    .map((mottaker, index) => (
                        <li key={`fullmektig-${index}`}>{mottaker.navn} | Fullmektig</li>
                    ))}
            {harVerge &&
                brevmottakere
                    .filter(mottaker => mottaker.type === MottakerType.Verge)
                    .map((mottaker, index) => (
                        <li key={`verge-${index}`}>{mottaker.navn} | Verge</li>
                    ))}
        </ul>
    );
};

export default BrevmottakerListe;
