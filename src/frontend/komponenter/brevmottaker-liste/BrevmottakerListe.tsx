import type { FC } from 'react';

import { useBehandling } from '~/context/BehandlingContext';
import { useFagsak } from '~/context/FagsakContext';
import { MottakerType } from '~/typer/Brevmottaker';
import { formaterIdent, lagPersonLabel } from '~/utils/formatter';

export const BrevmottakerListe: FC = () => {
    const { institusjon, bruker } = useFagsak();
    const { manuelleBrevmottakere } = useBehandling();
    const brevmottakere = manuelleBrevmottakere.map(({ brevmottaker }) => brevmottaker);
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
                    .map(mottaker => (
                        <li key={mottaker.personIdent}>{mottaker.navn} | Utenlandsk adresse</li>
                    ))}
            {harManuellDødsboadresse &&
                brevmottakere
                    .filter(mottaker => mottaker.type === MottakerType.Dødsbo)
                    .map(mottaker => <li key={mottaker.personIdent}>{mottaker.navn} | Dødsbo</li>)}
            {harFullmektig &&
                brevmottakere
                    .filter(mottaker => mottaker.type === MottakerType.Fullmektig)
                    .map(mottaker => (
                        <li key={mottaker.personIdent}>{mottaker.navn} | Fullmektig</li>
                    ))}
            {harVerge &&
                brevmottakere
                    .filter(mottaker => mottaker.type === MottakerType.Verge)
                    .map(mottaker => <li key={mottaker.personIdent}>{mottaker.navn} | Verge</li>)}
        </ul>
    );
};
