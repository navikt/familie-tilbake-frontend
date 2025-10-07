import type { Brevmottaker } from '../../../../typer/Brevmottaker';
import type { Institusjon } from '../../../../typer/fagsak';
import type { Person } from '../../../../typer/person';

import React from 'react';
import { styled } from 'styled-components';

import { MottakerType } from '../../../../typer/Brevmottaker';
import { formaterIdent, lagPersonLabel } from '../../../../utils/formatter';

type Props = {
    bruker: Person;
    institusjon: Institusjon | null;
    brevmottakere: Brevmottaker[];
    harMargin?: boolean;
};

type UlProps = {
    harMargin: boolean;
};

const StyledUl = styled.ul<UlProps>`
    ${(props: UlProps): string => (props.harMargin ? `` : `margin-top:0;margin-bottom:0;`)};
`;

const BrevmottakerListe: React.FC<Props> = ({
    bruker,
    institusjon,
    brevmottakere,
    harMargin = true,
}) => {
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
        <StyledUl harMargin={harMargin}>
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
        </StyledUl>
    );
};

export default BrevmottakerListe;
