import type { IBehandling } from '../../../../typer/behandling';
import type { IFagsak } from '../../../../typer/fagsak';

import { MottakerType, type IBrevmottaker } from '../../../../typer/Brevmottaker';
import { type Ressurs, RessursStatus } from '../../../../typer/ressurs';

/**
 * Henter eksisterende brevmottaker for redigering
 * Default-bruker returneres som MottakerType.Bruker, men mappes til BrukerMedUtenlandskAdresse-skjema
 */
export const hentEksisterendeBrevmottaker = (
    brevmottakerIdTilEndring: string,
    behandling: Ressurs<IBehandling> | undefined,
    fagsak: Ressurs<IFagsak> | undefined
): IBrevmottaker | undefined => {
    if (behandling?.status !== RessursStatus.Suksess || fagsak?.status !== RessursStatus.Suksess) {
        return undefined;
    }

    // Default-bruker beholdes som Bruker-type (ikke endret til BrukerMedUtenlandskAdresse)
    if (brevmottakerIdTilEndring === 'default-user') {
        return {
            type: MottakerType.Bruker,
            navn: fagsak.data.bruker.navn,
            personIdent: fagsak.data.bruker.personIdent,
            isDefault: true,
        } as IBrevmottaker & { isDefault: boolean };
    }

    // Finn manuell brevmottaker
    const manuellMottaker = behandling.data.manuelleBrevmottakere.find(
        (m: { id: string; brevmottaker: IBrevmottaker }) => m.id === brevmottakerIdTilEndring
    );

    return manuellMottaker?.brevmottaker;
};
