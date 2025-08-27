/**
 * Forenklet versjon av BrevmottakerContext som kun håndterer UI state management.
 * Dette erstatter den store BrevmottakerContext.tsx når vi har migrert til:
 * - react-hook-form for form-håndtering
 * - useBrevmottakerApi for API-kall
 * - Zod for validering
 *
 * Denne filen beholder kun:
 * - Brevmottaker state management
 * - AdresseKilde state
 * - Navigasjon og cleanup
 */
import type { IBehandling } from '../../../typer/behandling';
import type { IBrevmottaker } from '../../../typer/Brevmottaker';
import type { IFagsak } from '../../../typer/fagsak';

import createUseContext from 'constate';
import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { useBehandlingApi } from '../../../api/behandling';
import { useBehandling } from '../../../context/BehandlingContext';
import { AdresseKilde, MottakerType } from '../../../typer/Brevmottaker';
import { RessursStatus, type Ressurs } from '../../../typer/ressurs';
import { sider } from '../../Felleskomponenter/Venstremeny/sider';

// const skalEkskludereDefaultMottaker = (brevmottakere: IBrevmottaker[]): boolean => {
//     return brevmottakere.some(
//         brevmottaker =>
//             brevmottaker.type === MottakerType.BrukerMedUtenlandskAdresse ||
//             brevmottaker.type === MottakerType.Dødsbo
//     );
// };

interface IProps {
    behandling: IBehandling;
    fagsak: IFagsak;
}

const [BrevmottakerProvider, useBrevmottaker] = createUseContext(
    ({ behandling, fagsak }: IProps) => {
        const bruker: IBrevmottaker = {
            type: MottakerType.Bruker,
            navn: fagsak.bruker.navn,
            personIdent: fagsak.bruker.personIdent,
        };

        const defaultMottaker = 'bruker';
        const [brevmottakere, setBrevMottakere] = useState<{ [id: string]: IBrevmottaker }>({
            [defaultMottaker]: bruker,
        });

        const [adresseKilde, setAdresseKilde] = useState<AdresseKilde>(AdresseKilde.Udefinert);
        const [brevmottakerIdTilEndring, setBrevmottakerIdTilEndring] = useState<
            string | undefined
        >();

        const { hentBehandlingMedBehandlingId } = useBehandling();
        const { fjernManuellBrevmottaker } = useBehandlingApi();
        const navigate = useNavigate();

        // Synkroniser med behandling data
        React.useEffect(() => {
            const manuelleBrevmottakere: { [id: string]: IBrevmottaker } = {};
            behandling.manuelleBrevmottakere.forEach(value => {
                manuelleBrevmottakere[value.id] = value.brevmottaker;
            });
            setBrevMottakere(manuelleBrevmottakere);
        }, [behandling, setBrevMottakere]);

        // Håndter default mottaker logikk
        // React.useEffect(() => {
        //     if (skalEkskludereDefaultMottaker(Object.values(brevmottakere))) {
        //         fjernBrevmottaker(defaultMottaker);
        //     } else if (!Object.keys(brevmottakere).includes(defaultMottaker)) {
        //         leggTilEllerOppdaterBrevmottaker(defaultMottaker, bruker);
        //     }
        //     // eslint-disable-next-line react-hooks/exhaustive-deps
        // }, [brevmottakere]);

        // const leggTilEllerOppdaterBrevmottaker = (
        //     id: string,
        //     brevmottaker: IBrevmottaker
        // ): void => {
        //     settBrevMottakere({ ...brevmottakere, [id]: brevmottaker });
        // };

        // const fjernBrevmottaker = (id: string): void => {
        //     const { [id]: fjernet, ...gjenværende } = brevmottakere;
        //     if (fjernet !== undefined) {
        //         settBrevMottakere(gjenværende);
        //     }
        // };

        const fjernBrevMottakerOgOppdaterState = (mottakerId: string): void => {
            fjernManuellBrevmottaker(behandling.behandlingId, mottakerId).then(
                (respons: Ressurs<string>) => {
                    if (respons.status === RessursStatus.Suksess) {
                        hentBehandlingMedBehandlingId(behandling.behandlingId);
                    }
                }
            );
        };

        const gåTilNeste = (): void => {
            navigate(
                `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}/${sider.FAKTA.href}`
            );
        };

        return {
            behandling,
            fagsak,
            brevmottakere,
            fjernBrevMottakerOgOppdaterState,
            gåTilNeste,
            adresseKilde,
            setAdresseKilde,
            brevmottakerIdTilEndring,
            setBrevmottakerIdTilEndring,
            bruker,
        };
    }
);

export { BrevmottakerProvider, useBrevmottaker };
