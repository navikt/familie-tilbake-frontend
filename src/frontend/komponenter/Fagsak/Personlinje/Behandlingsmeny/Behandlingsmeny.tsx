import { ChevronDownIcon } from '@navikt/aksel-icons';
import { Button, Dropdown } from '@navikt/ds-react';
import * as React from 'react';
import { useState } from 'react';

import EndreBehandlendeEnhet from './EndreBehandlendeEnhet/EndreBehandlendeEnhet';
import GjennoptaBehandling from './GjennoptaBehandling/GjennoptaBehandling';
import HenleggBehandling from './HenleggBehandling/HenleggBehandling';
import HentOppdatertKravgrunnlag from './hentOppdatertKravgrunnlag/HentOppdatertKravgrunnlag';
import HistoriskeVurderinger from './HistoriskeVurderinger/HistoriskeVurderinger';
import LeggTilFjernBrevmottakere from './LeggTilFjernBrevmottakere/LeggTilFjernBrevmottakere';
import OpprettBehandling from './OpprettBehandling/OpprettBehandling';
import SettBehandlingPåVent from './SettBehandlingPåVent/SettBehandlingPåVent';
import { SettBehandlingTilbakeTilFakta } from './SettBehandlingTilbakeTilFakta/SettBehandlingTilbakeTilFakta';
import { useApp } from '../../../../context/AppContext';
import { useBehandling } from '../../../../context/BehandlingContext';
import { ToggleName } from '../../../../context/toggles';
import { useToggles } from '../../../../context/TogglesContext';
import { Fagsystem } from '../../../../kodeverk';
import { useFagsakStore } from '../../../../stores/fagsakStore';
import { Behandlingssteg, Behandlingstatus } from '../../../../typer/behandling';
import { RessursStatus } from '../../../../typer/ressurs';

const Behandlingsmeny: React.FC = () => {
    const { behandling, ventegrunn, erStegBehandlet, aktivtSteg } = useBehandling();
    const [visMeny, settVisMeny] = useState(false);
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
    const { toggles } = useToggles();

    return (
        <Dropdown open={visMeny} onOpenChange={settVisMeny}>
            <Button
                as={Dropdown.Toggle}
                id="behandlingsmeny-arialabel-knapp"
                size="small"
                variant="secondary"
                icon={<ChevronDownIcon fontSize="1.375rem" />}
                iconPosition="right"
            >
                Behandlingsmeny
            </Button>

            <Dropdown.Menu placement="bottom-end" aria-labelledby="behandlingsmeny-arialabel-knapp">
                <ul className="min-w-60 m-0" role="menu">
                    {behandling?.status === RessursStatus.Suksess && (
                        <li>
                            <OpprettBehandling
                                behandling={behandling.data}
                                onListElementClick={() => settVisMeny(false)}
                            />
                        </li>
                    )}

                    {behandling?.status === RessursStatus.Suksess &&
                        behandling.data.status !== Behandlingstatus.Avsluttet &&
                        !vedtakFattetEllerFattes &&
                        behandling.data.kanEndres && (
                            <>
                                <li>
                                    <HenleggBehandling
                                        behandling={behandling.data}
                                        onListElementClick={() => settVisMeny(false)}
                                    />
                                </li>

                                {erForvalter && (
                                    <li>
                                        <HentOppdatertKravgrunnlag
                                            behandling={behandling.data}
                                            onListElementClick={() => settVisMeny(false)}
                                        />
                                    </li>
                                )}

                                {(toggles[ToggleName.SaksbehanderKanResettebehandling] ||
                                    erForvalter) && (
                                    <li>
                                        <SettBehandlingTilbakeTilFakta
                                            behandling={behandling.data}
                                            onListElementClick={() => settVisMeny(false)}
                                        />
                                    </li>
                                )}

                                {!venterPåKravgrunnlag &&
                                    (behandling.data.erBehandlingPåVent || ventegrunn ? (
                                        <li>
                                            <GjennoptaBehandling
                                                behandling={behandling.data}
                                                onListElementClick={() => settVisMeny(false)}
                                            />
                                        </li>
                                    ) : (
                                        <li>
                                            <SettBehandlingPåVent
                                                behandling={behandling.data}
                                                onListElementClick={() => settVisMeny(false)}
                                            />
                                        </li>
                                    ))}

                                {fagsystem === Fagsystem.BA && ytelsestype && (
                                    <li>
                                        <EndreBehandlendeEnhet
                                            ytelse={ytelsestype}
                                            behandling={behandling.data}
                                            onListElementClick={() => settVisMeny(false)}
                                        />
                                    </li>
                                )}

                                {behandling.data.støtterManuelleBrevmottakere && (
                                    <li>
                                        <LeggTilFjernBrevmottakere
                                            behandling={behandling.data}
                                            onListElementClick={() => settVisMeny(false)}
                                        />
                                    </li>
                                )}

                                <li>
                                    <HistoriskeVurderinger
                                        behandling={behandling.data}
                                        onListElementClick={() => settVisMeny(false)}
                                    />
                                </li>
                            </>
                        )}
                </ul>
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default Behandlingsmeny;
