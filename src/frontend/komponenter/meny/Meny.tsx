import type { FC } from 'react';

import { MenuElipsisHorizontalIcon } from '@navikt/aksel-icons';
import { ActionMenu, Button } from '@navikt/ds-react';
import { useState } from 'react';

import { useApp } from '~/context/AppContext';
import { useBehandling } from '~/context/BehandlingContext';
import { useBehandlingState } from '~/context/BehandlingStateContext';
import { useFagsak } from '~/context/FagsakContext';
import { Fagsystem } from '~/kodeverk';

import { EndreEnhet } from './endre-enhet/EndreEnhet';
import { Gjenoppta } from './gjenoppta/Gjenoppta';
import { Henlegg } from './henlegg/Henlegg';
import { HentKorrigertKravgrunnlag } from './hent-korrigert-kravgrunnlag/HentKorrigertKravgrunnlag';
import { HistoriskeVurderinger } from './historiske-vurderinger/HistoriskeVurderinger';
import { LeggTilFjernBrevmottakere } from './legg-til-fjern-brevmottakere/LeggTilFjernBrevmottakere';
import { Revurder } from './revurder/Revurder';
import { SettPåVent } from './sett-på-vent/SettPåVent';
import { StartPåNytt } from './start-på-nytt/StartPåNytt';

export const Behandlingsmeny: FC = () => {
    const behandling = useBehandling();
    const { ventegrunn, erStegBehandlet, aktivtSteg, behandlingILesemodus } = useBehandlingState();
    const [holdMenyenÅpen, setHoldMenyenÅpen] = useState(false);
    const { fagsystem } = useFagsak();
    const { innloggetSaksbehandler } = useApp();
    const forvalterGruppe =
        process.env.NODE_ENV === 'production'
            ? '3d718ae5-f25e-47a4-b4b3-084a97604c1d'
            : 'c62e908a-cf20-4ad0-b7b3-3ff6ca4bf38b';
    const erForvalter = innloggetSaksbehandler?.groups?.some(group => group === forvalterGruppe);

    const venterPåKravgrunnlag = ventegrunn?.behandlingssteg === 'GRUNNLAG';
    const vedtakFattetEllerFattes =
        erStegBehandlet('FATTE_VEDTAK') || aktivtSteg?.behandlingssteg === 'FATTE_VEDTAK';

    const erBehandlingenAktiv =
        behandling.status !== 'AVSLUTTET' && !vedtakFattetEllerFattes && behandling.kanEndres;
    const erSattPåvent = behandling.erBehandlingPåVent || ventegrunn;
    const kanEndreEnhet = fagsystem === Fagsystem.BA;
    return (
        <ActionMenu open={holdMenyenÅpen} onOpenChange={setHoldMenyenÅpen}>
            <ActionMenu.Trigger>
                <Button
                    size="small"
                    variant="tertiary"
                    icon={<MenuElipsisHorizontalIcon fontSize="1.5rem" aria-hidden />}
                >
                    Meny
                </Button>
            </ActionMenu.Trigger>

            <ActionMenu.Content onClick={() => setHoldMenyenÅpen(true)}>
                <ActionMenu.Group aria-label="Menyvalg">
                    {behandling.kanRevurderingOpprettes && !behandling.erNyModell && <Revurder />}

                    {(behandling.kanSetteTilbakeTilFakta || erForvalter) && <StartPåNytt />}

                    {erBehandlingenAktiv && !behandling.erNyModell && (
                        <>
                            {behandling.kanHenleggeBehandling && <Henlegg />}

                            {!venterPåKravgrunnlag &&
                                (erSattPåvent ? <Gjenoppta /> : <SettPåVent />)}

                            {erForvalter && <HentKorrigertKravgrunnlag />}

                            {!behandlingILesemodus && (
                                <>
                                    <ActionMenu.Divider />

                                    {behandling.støtterManuelleBrevmottakere && (
                                        <LeggTilFjernBrevmottakere />
                                    )}

                                    {kanEndreEnhet && <EndreEnhet />}

                                    <HistoriskeVurderinger />
                                </>
                            )}
                        </>
                    )}
                </ActionMenu.Group>
            </ActionMenu.Content>
        </ActionMenu>
    );
};
