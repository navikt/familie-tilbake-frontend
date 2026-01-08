import { MenuElipsisHorizontalIcon } from '@navikt/aksel-icons';
import { ActionMenu, Button } from '@navikt/ds-react';
import * as React from 'react';
import { useState } from 'react';

import { EndreEnhet } from './endreEnhet/EndreEnhet';
import { Gjenoppta } from './gjenoppta/Gjenoppta';
import { Henlegg } from './henlegg/Henlegg';
import { HentKorrigertKravgrunnlag } from './hentKorrigertKravgrunnlag/HentKorrigertKravgrunnlag';
import { HistoriskeVurderinger } from './historiskeVurderinger/HistoriskeVurderinger';
import { LeggTilFjernBrevmottakere } from './leggTilFjernBrevmottakere/LeggTilFjernBrevmottakere';
import { Revurder } from './revurder/Revurder';
import { SettPåVent } from './settPåVent/SettPåVent';
import { StartPåNytt } from './startPåNytt/StartPåNytt';
import { useApp } from '../../../context/AppContext';
import { useBehandling } from '../../../context/BehandlingContext';
import { useFagsak } from '../../../context/FagsakContext';
import { Fagsystem } from '../../../kodeverk';
import { Behandlingssteg, Behandlingstatus } from '../../../typer/behandling';
import { RessursStatus } from '../../../typer/ressurs';

export const Behandlingsmeny: React.FC = () => {
    const { behandling, ventegrunn, erStegBehandlet, aktivtSteg, behandlingILesemodus } =
        useBehandling();
    const [holdMenyenÅpen, setHoldMenyenÅpen] = useState(false);
    const { fagsystem, ytelsestype } = useFagsak();
    const { innloggetSaksbehandler } = useApp();
    const forvalterGruppe =
        process.env.NODE_ENV === 'production'
            ? '3d718ae5-f25e-47a4-b4b3-084a97604c1d'
            : 'c62e908a-cf20-4ad0-b7b3-3ff6ca4bf38b';
    const erForvalter = innloggetSaksbehandler?.groups?.some(group => group === forvalterGruppe);

    const venterPåKravgrunnlag = ventegrunn?.behandlingssteg === Behandlingssteg.Grunnlag;
    const vedtakFattetEllerFattes =
        erStegBehandlet(Behandlingssteg.FatteVedtak) ||
        aktivtSteg?.behandlingssteg === Behandlingssteg.FatteVedtak;

    if (behandling?.status !== RessursStatus.Suksess) {
        return null;
    }
    const erBehandlingenAktiv =
        behandling.data.status !== Behandlingstatus.Avsluttet &&
        !vedtakFattetEllerFattes &&
        behandling.data.kanEndres;
    const erSattPåvent = behandling.data.erBehandlingPåVent || ventegrunn;
    const kanEndreEnhet = fagsystem === Fagsystem.BA && ytelsestype;
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
                    {behandling.data.kanRevurderingOpprettes && (
                        <Revurder behandlingId={behandling.data.behandlingId} />
                    )}

                    {erBehandlingenAktiv && (
                        <>
                            {behandling.data.kanHenleggeBehandling && (
                                <Henlegg behandling={behandling.data} />
                            )}

                            {!venterPåKravgrunnlag &&
                                (erSattPåvent ? (
                                    <Gjenoppta behandling={behandling.data} />
                                ) : (
                                    <SettPåVent behandling={behandling.data} />
                                ))}

                            {erForvalter && (
                                <>
                                    {behandling.data.kanSetteTilbakeTilFakta && (
                                        <StartPåNytt behandling={behandling.data} />
                                    )}

                                    <HentKorrigertKravgrunnlag behandling={behandling.data} />
                                </>
                            )}

                            {!behandlingILesemodus && (
                                <>
                                    <ActionMenu.Divider />

                                    {behandling.data.støtterManuelleBrevmottakere && (
                                        <LeggTilFjernBrevmottakere behandling={behandling.data} />
                                    )}

                                    {kanEndreEnhet && (
                                        <EndreEnhet behandlingsId={behandling.data.behandlingId} />
                                    )}

                                    <HistoriskeVurderinger behandling={behandling.data} />
                                </>
                            )}
                        </>
                    )}
                </ActionMenu.Group>
            </ActionMenu.Content>
        </ActionMenu>
    );
};
