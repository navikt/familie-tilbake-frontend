import { ChevronDownIcon } from '@navikt/aksel-icons';
import { Button, Dropdown } from '@navikt/ds-react';
import * as React from 'react';

import { EndreBehandlendeEnhet } from './EndreBehandlendeEnhet/EndreBehandlendeEnhet';
import { GjennoptaBehandling } from './GjennoptaBehandling/GjennoptaBehandling';
import { HenleggBehandling } from './HenleggBehandling/HenleggBehandling';
import { HentOppdatertKravgrunnlag } from './hentOppdatertKravgrunnlag/HentOppdatertKravgrunnlag';
import { HistoriskeVurderinger } from './HistoriskeVurderinger/HistoriskeVurderinger';
import { LeggTilFjernBrevmottakere } from './LeggTilFjernBrevmottakere/LeggTilFjernBrevmottakere';
import { OpprettBehandling } from './OpprettBehandling/OpprettBehandling';
import { SettBehandlingPåVent } from './SettBehandlingPåVent/SettBehandlingPåVent';
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
        <Dropdown closeOnSelect>
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
                <Dropdown.Menu.List className="min-w-60 m-0">
                    {behandling?.status === RessursStatus.Suksess && (
                        <Dropdown.Menu.List.Item className="p-0">
                            <OpprettBehandling behandling={behandling.data} />
                        </Dropdown.Menu.List.Item>
                    )}

                    {behandling?.status === RessursStatus.Suksess &&
                        behandling.data.status !== Behandlingstatus.Avsluttet &&
                        !vedtakFattetEllerFattes &&
                        behandling.data.kanEndres && (
                            <>
                                <Dropdown.Menu.List.Item className="p-0">
                                    <HenleggBehandling behandling={behandling.data} />
                                </Dropdown.Menu.List.Item>

                                {erForvalter && (
                                    <Dropdown.Menu.List.Item className="p-0">
                                        <HentOppdatertKravgrunnlag behandling={behandling.data} />
                                    </Dropdown.Menu.List.Item>
                                )}

                                {(toggles[ToggleName.SaksbehanderKanResettebehandling] ||
                                    erForvalter) && (
                                    <Dropdown.Menu.List.Item className="p-0">
                                        <SettBehandlingTilbakeTilFakta
                                            behandling={behandling.data}
                                        />
                                    </Dropdown.Menu.List.Item>
                                )}

                                {!venterPåKravgrunnlag &&
                                    (behandling.data.erBehandlingPåVent || ventegrunn ? (
                                        <Dropdown.Menu.List.Item className="p-0">
                                            <GjennoptaBehandling behandling={behandling.data} />
                                        </Dropdown.Menu.List.Item>
                                    ) : (
                                        <Dropdown.Menu.List.Item className="p-0">
                                            <SettBehandlingPåVent behandling={behandling.data} />
                                        </Dropdown.Menu.List.Item>
                                    ))}

                                {fagsystem === Fagsystem.BA && ytelsestype && (
                                    <Dropdown.Menu.List.Item className="p-0">
                                        <EndreBehandlendeEnhet behandling={behandling.data} />
                                    </Dropdown.Menu.List.Item>
                                )}

                                {behandling.data.støtterManuelleBrevmottakere && (
                                    <Dropdown.Menu.List.Item className="p-0">
                                        <LeggTilFjernBrevmottakere behandling={behandling.data} />
                                    </Dropdown.Menu.List.Item>
                                )}

                                <Dropdown.Menu.List.Item className="p-0">
                                    <HistoriskeVurderinger behandling={behandling.data} />
                                </Dropdown.Menu.List.Item>
                            </>
                        )}
                </Dropdown.Menu.List>
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default Behandlingsmeny;
