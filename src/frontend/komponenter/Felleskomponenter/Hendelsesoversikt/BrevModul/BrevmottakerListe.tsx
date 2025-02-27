import type { IBrevmottaker } from '../../../../typer/Brevmottaker';
import type { IInstitusjon } from '../../../../typer/fagsak';
import type { IPerson } from '../../../../typer/person';

import React from 'react';
import { styled } from 'styled-components';

import { MottakerType } from '../../../../typer/Brevmottaker';
import { formaterIdent, lagPersonLabel } from '../../../../utils/formatter';

interface IProps {
    bruker: IPerson;
    institusjon: IInstitusjon | undefined;
    brevmottakere: IBrevmottaker[];
    harMargin?: boolean;
}
interface UlProps {
    harMargin: boolean;
}
const StyledUl = styled.ul`
    ${(props: UlProps) => (props.harMargin ? `` : `margin-top:0;margin-bottom:0;`)};
`;

const BrevmottakerListe: React.FC<IProps> = ({
    bruker,
    institusjon,
    brevmottakere,
    harMargin = true,
}) => {
    const skalViseInstitusjon = !!institusjon;
    const harUtenlandskAdresse = brevmottakere.some(
        mottaker => mottaker.type === MottakerType.BRUKER_MED_UTENLANDSK_ADRESSE
    );
    const harFullmektig = brevmottakere.some(mottaker => mottaker.type === MottakerType.FULLMEKTIG);
    const harVerge = brevmottakere.some(mottaker => mottaker.type === MottakerType.VERGE);
    const harManuellDødsboadresse = brevmottakere.some(
        mottaker => mottaker.type === MottakerType.DØDSBO
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
                    .filter(
                        mottaker => mottaker.type === MottakerType.BRUKER_MED_UTENLANDSK_ADRESSE
                    )
                    .map((mottaker, index) => (
                        <li key={`utenlandsk-adresse-${index}`}>
                            {mottaker.navn} | Utenlandsk adresse
                        </li>
                    ))}
            {harManuellDødsboadresse &&
                brevmottakere
                    .filter(mottaker => mottaker.type === MottakerType.DØDSBO)
                    .map((mottaker, index) => (
                        <li key={`doedsbo-${index}`}>{mottaker.navn} | Dødsbo</li>
                    ))}
            {harFullmektig &&
                brevmottakere
                    .filter(mottaker => mottaker.type === MottakerType.FULLMEKTIG)
                    .map((mottaker, index) => (
                        <li key={`fullmektig-${index}`}>{mottaker.navn} | Fullmektig</li>
                    ))}
            {harVerge &&
                brevmottakere
                    .filter(mottaker => mottaker.type === MottakerType.VERGE)
                    .map((mottaker, index) => (
                        <li key={`verge-${index}`}>{mottaker.navn} | Verge</li>
                    ))}
        </StyledUl>
    );
};

export default BrevmottakerListe;
