import type { Behandling } from '../../../../../typer/behandling';

import { Button, Dropdown, ErrorMessage, Modal } from '@navikt/ds-react';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { useHttp } from '../../../../../api/http/HttpProvider';
import { useApp } from '../../../../../context/AppContext';
import { useBehandling } from '../../../../../context/BehandlingContext';
import { useRedirectEtterLagring } from '../../../../../hooks/useRedirectEtterLagring';
import { useFagsakStore } from '../../../../../stores/fagsakStore';
import { Behandlingssteg, Behandlingsstegstatus } from '../../../../../typer/behandling';
import { type Ressurs, RessursStatus } from '../../../../../typer/ressurs';
import { SYNLIGE_STEG } from '../../../../../utils/sider';
import { AlertType, ToastTyper } from '../../../../Felleskomponenter/Toast/typer';

type Props = {
    behandling: Behandling;
};

export const LeggTilFjernBrevmottakere: React.FC<Props> = ({ behandling }) => {
    const [visFjernModal, settVisFjernModal] = useState(false);
    const [senderInn, settSenderInn] = useState(false);
    const [feilmelding, settFeilmelding] = useState('');
    const {
        hentBehandlingMedBehandlingId,
        behandlingILesemodus,
        settVisBrevmottakerModal,
        nullstillIkkePersisterteKomponenter,
    } = useBehandling();

    const { fagsystem, eksternFagsakId } = useFagsakStore();
    const { utførRedirect } = useRedirectEtterLagring();
    const { request } = useHttp();
    const { settToast } = useApp();
    const navigate = useNavigate();

    const kanFjerneManuelleBrevmottakere =
        behandling.manuelleBrevmottakere.length ||
        behandling.behandlingsstegsinfo.some(
            steg =>
                steg.behandlingssteg === Behandlingssteg.Brevmottaker &&
                steg.behandlingsstegstatus !== Behandlingsstegstatus.Tilbakeført
        );

    const opprettBrevmottakerSteg = (): void => {
        nullstillIkkePersisterteKomponenter();
        settSenderInn(true);
        request<void, string>({
            method: 'POST',
            url: `/familie-tilbake/api/brevmottaker/manuell/${behandling.behandlingId}/aktiver`,
        }).then((respons: Ressurs<string>) => {
            settSenderInn(false);
            if (respons.status === RessursStatus.Suksess && fagsystem && eksternFagsakId) {
                settVisBrevmottakerModal(true);
                hentBehandlingMedBehandlingId(behandling.behandlingId).then(() => {
                    navigate(
                        `/fagsystem/${fagsystem}/fagsak/${eksternFagsakId}/behandling/${behandling.eksternBrukId}/${SYNLIGE_STEG.BREVMOTTAKER.href}`
                    );
                });
            } else if (
                respons.status === RessursStatus.Feilet ||
                respons.status === RessursStatus.FunksjonellFeil ||
                respons.status === RessursStatus.IkkeTilgang
            ) {
                settFeilmelding(respons.frontendFeilmelding);
            }
        });
    };

    const fjernBrevmottakerSteg = (): void => {
        nullstillIkkePersisterteKomponenter();
        settSenderInn(true);
        request<void, string>({
            method: 'PUT',
            url: `/familie-tilbake/api/brevmottaker/manuell/${behandling.behandlingId}/deaktiver`,
        }).then((respons: Ressurs<string>) => {
            settSenderInn(false);
            if (respons.status === RessursStatus.Suksess && fagsystem && eksternFagsakId) {
                settVisFjernModal(false);
                hentBehandlingMedBehandlingId(behandling.behandlingId).then(() => {
                    utførRedirect(
                        `/fagsystem/${fagsystem}/fagsak/${eksternFagsakId}/behandling/${behandling.eksternBrukId}`
                    );
                });
            } else if (
                respons.status === RessursStatus.Feilet ||
                respons.status === RessursStatus.FunksjonellFeil ||
                respons.status === RessursStatus.IkkeTilgang
            ) {
                settFeilmelding(respons.frontendFeilmelding);
            }
        });
    };

    const opprettEllerFjernSteg = (): void => {
        if (kanFjerneManuelleBrevmottakere) {
            settVisFjernModal(true);
        } else {
            opprettBrevmottakerSteg();
        }
    };

    useEffect(() => {
        if (feilmelding !== '') {
            settToast(ToastTyper.BrevmottakerIkkeTillat, {
                alertType: AlertType.Warning,
                tekst: feilmelding,
            });
            settFeilmelding('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [feilmelding]);

    return (
        <Dropdown.Menu.List.Item
            onClick={opprettEllerFjernSteg}
            disabled={!behandling.kanEndres || behandlingILesemodus}
        >
            {kanFjerneManuelleBrevmottakere ? 'Fjern brevmottaker(e)' : 'Legg til brevmottaker'}

            {visFjernModal && (
                <Modal
                    open
                    header={{ heading: 'Ønsker du å fjerne brevmottaker(e)?', size: 'medium' }}
                    portal
                    width="small"
                    onClose={() => settVisFjernModal(false)}
                >
                    <Modal.Body>
                        <div>
                            Dette vil både fjerne eventuelt registrerte brevmottakere og fjerne
                            steget &quot;Brevmottaker(e)&quot;.
                        </div>
                        {feilmelding !== '' && (
                            <div className="skjemaelement__feilmelding">
                                <ErrorMessage size="small">{feilmelding}</ErrorMessage>
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            key="bekreft"
                            disabled={senderInn}
                            loading={senderInn}
                            onClick={fjernBrevmottakerSteg}
                            size="small"
                        >
                            Ja, fjern
                        </Button>
                        <Button
                            variant="tertiary"
                            key="avbryt"
                            onClick={() => settVisFjernModal(false)}
                            size="small"
                        >
                            Nei, behold
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </Dropdown.Menu.List.Item>
    );
};
