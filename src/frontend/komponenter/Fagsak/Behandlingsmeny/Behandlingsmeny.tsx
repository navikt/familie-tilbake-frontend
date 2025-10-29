import { MenuElipsisHorizontalIcon } from '@navikt/aksel-icons';
import { ActionMenu, Button } from '@navikt/ds-react';
import * as React from 'react';
import { useState } from 'react';

import { EndreBehandlendeEnhet } from './EndreBehandlendeEnhet/EndreBehandlendeEnhet';
import { GjennoptaBehandling } from './GjennoptaBehandling/GjennoptaBehandling';
import { Henlegg } from './henlegg/Henlegg';
import { HentOppdatertKravgrunnlag } from './hentOppdatertKravgrunnlag/HentOppdatertKravgrunnlag';
import { HistoriskeVurderinger } from './HistoriskeVurderinger/HistoriskeVurderinger';
import { LeggTilFjernBrevmottakere } from './LeggTilFjernBrevmottakere/LeggTilFjernBrevmottakere';
import { Revurder } from './revurder/Revurder';
import { SettBehandlingPåVent } from './settPåVent/SettPåVent';
// import { SettBehandlingPåVent } from './SettBehandlingPåVent/SettBehandlingPåVent';
import { StartPåNytt } from './startPåNytt/StartPåNytt';
import { useApp } from '../../../context/AppContext';
import { useBehandling } from '../../../context/BehandlingContext';
import { Fagsystem } from '../../../kodeverk';
import { useFagsakStore } from '../../../stores/fagsakStore';
import { Behandlingssteg, Behandlingstatus } from '../../../typer/behandling';
import { RessursStatus } from '../../../typer/ressurs';

export const Behandlingsmeny: React.FC = () => {
    const { behandling, ventegrunn, erStegBehandlet, aktivtSteg, behandlingILesemodus } =
        useBehandling();
    const [holdMenyenÅpen, setHoldMenyenÅpen] = useState(false);
    // const actionMenuRef = useRef<HTMLDivElement | null>(null);
    const { fagsystem, ytelsestype } = useFagsakStore();
    const { innloggetSaksbehandler } = useApp();
    const erProd =
        !window.location.hostname.includes('dev') &&
        !window.location.hostname.includes('localhost');
    const forvalterGruppe = erProd
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

    return (
        <ActionMenu open={holdMenyenÅpen} onOpenChange={setHoldMenyenÅpen}>
            <ActionMenu.Trigger>
                <Button
                    id="behandlingsmeny-knapp"
                    size="small"
                    variant="tertiary"
                    icon={<MenuElipsisHorizontalIcon fontSize="1.5rem" aria-hidden />}
                >
                    Behandlingsmeny
                </Button>
            </ActionMenu.Trigger>

            <ActionMenu.Content
                aria-labelledby="behandlingsmeny-knapp"
                // ref={actionMenuRef}
                onClick={() => setHoldMenyenÅpen(true)}
            >
                <ActionMenu.Group aria-label="Behandlingsmenyvalg">
                    {behandling.data.kanRevurderingOpprettes && (
                        <Revurder behandlingId={behandling.data.behandlingId} />
                    )}

                    {behandling.data.status !== Behandlingstatus.Avsluttet &&
                        !vedtakFattetEllerFattes &&
                        behandling.data.kanEndres && (
                            <>
                                {!behandling.data.kanHenleggeBehandling && (
                                    <Henlegg behandling={behandling.data} />
                                )}

                                {!venterPåKravgrunnlag &&
                                    (behandling.data.erBehandlingPåVent || ventegrunn ? (
                                        <GjennoptaBehandling behandling={behandling.data} />
                                    ) : (
                                        <SettBehandlingPåVent behandling={behandling.data} />
                                    ))}

                                {erForvalter && (
                                    <>
                                        {behandling.data.kanSetteTilbakeTilFakta && (
                                            <StartPåNytt behandling={behandling.data} />
                                        )}

                                        <HentOppdatertKravgrunnlag behandling={behandling.data} />
                                    </>
                                )}

                                {!behandlingILesemodus && (
                                    <>
                                        <ActionMenu.Divider />

                                        {behandling.data.støtterManuelleBrevmottakere && (
                                            <LeggTilFjernBrevmottakere
                                                behandling={behandling.data}
                                            />
                                        )}

                                        {fagsystem === Fagsystem.BA && ytelsestype && (
                                            <EndreBehandlendeEnhet behandling={behandling.data} />
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
