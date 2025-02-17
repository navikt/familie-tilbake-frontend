import * as React from 'react';
import { useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import { Button, ErrorMessage, Modal } from '@navikt/ds-react';
import { useHttp } from '@navikt/familie-http';

import { useApp } from '../../../../../context/AppContext';
import { useBehandling } from '../../../../../context/BehandlingContext';
import { useRedirectEtterLagring } from '../../../../../hooks/useRedirectEtterLagring';
import {
    Behandlingssteg,
    Behandlingsstegstatus,
    IBehandling,
} from '../../../../../typer/behandling';
import { IFagsak } from '../../../../../typer/fagsak';
import { BehandlingsMenyButton } from '../../../../Felleskomponenter/Flytelementer';
import { AlertType, ToastTyper } from '../../../../Felleskomponenter/Toast/typer';
import { sider } from '../../../../Felleskomponenter/Venstremeny/sider';
import { type Ressurs, RessursStatus } from '../../../../../typer/ressurs';

interface IProps {
    behandling: IBehandling;
    fagsak: IFagsak;
    onListElementClick: () => void;
}

const LeggTilFjernBrevmottakere: React.FC<IProps> = ({
    behandling,
    fagsak,
    onListElementClick,
}) => {
    const [visFjernModal, settVisFjernModal] = React.useState<boolean>(false);
    const [senderInn, settSenderInn] = React.useState<boolean>(false);
    const [feilmelding, settFeilmelding] = React.useState<string>();
    const {
        hentBehandlingMedBehandlingId,
        behandlingILesemodus,
        settVisBrevmottakerModal,
        nullstillIkkePersisterteKomponenter,
    } = useBehandling();
    const { utførRedirect } = useRedirectEtterLagring();
    const { request } = useHttp();
    const { settToast } = useApp();
    const navigate = useNavigate();

    const kanFjerneManuelleBrevmottakere =
        behandling.manuelleBrevmottakere.length ||
        behandling.behandlingsstegsinfo.some(
            steg =>
                steg.behandlingssteg === Behandlingssteg.BREVMOTTAKER &&
                steg.behandlingsstegstatus !== Behandlingsstegstatus.TILBAKEFØRT
        );

    const opprettBrevmottakerSteg = () => {
        nullstillIkkePersisterteKomponenter();
        settSenderInn(true);
        request<void, string>({
            method: 'POST',
            url: `/familie-tilbake/api/brevmottaker/manuell/${behandling.behandlingId}/aktiver`,
        }).then((respons: Ressurs<string>) => {
            settSenderInn(false);
            if (respons.status === RessursStatus.SUKSESS) {
                settVisBrevmottakerModal(true);
                hentBehandlingMedBehandlingId(behandling.behandlingId).then(() => {
                    navigate(
                        `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}/${sider.BREVMOTTAKER.href}`
                    );
                });
            } else if (
                respons.status === RessursStatus.FEILET ||
                respons.status === RessursStatus.FUNKSJONELL_FEIL ||
                respons.status === RessursStatus.IKKE_TILGANG
            ) {
                settFeilmelding(respons.frontendFeilmelding);
            }
        });
    };

    const fjernBrevmottakerSteg = () => {
        nullstillIkkePersisterteKomponenter();
        settSenderInn(true);
        request<void, string>({
            method: 'PUT',
            url: `/familie-tilbake/api/brevmottaker/manuell/${behandling.behandlingId}/deaktiver`,
        }).then((respons: Ressurs<string>) => {
            settSenderInn(false);
            if (respons.status === RessursStatus.SUKSESS) {
                settVisFjernModal(false);
                hentBehandlingMedBehandlingId(behandling.behandlingId).then(() => {
                    utførRedirect(
                        `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}`
                    );
                });
            } else if (
                respons.status === RessursStatus.FEILET ||
                respons.status === RessursStatus.FUNKSJONELL_FEIL ||
                respons.status === RessursStatus.IKKE_TILGANG
            ) {
                settFeilmelding(respons.frontendFeilmelding);
            }
        });
    };

    const opprettEllerFjernSteg = () => {
        if (kanFjerneManuelleBrevmottakere) {
            settVisFjernModal(true);
        } else {
            opprettBrevmottakerSteg();
        }
    };

    useEffect(() => {
        if (feilmelding && feilmelding !== '') {
            settToast(ToastTyper.BREVMOTTAKER_IKKE_TILLAT, {
                alertType: AlertType.WARNING,
                tekst: feilmelding,
            });
            settFeilmelding('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [feilmelding]);

    return (
        <>
            <BehandlingsMenyButton
                variant="tertiary"
                onClick={() => {
                    opprettEllerFjernSteg();
                    onListElementClick();
                }}
                disabled={!behandling.kanEndres || behandlingILesemodus}
            >
                {kanFjerneManuelleBrevmottakere ? 'Fjern brevmottaker(e)' : 'Legg til brevmottaker'}
            </BehandlingsMenyButton>

            {visFjernModal && (
                <Modal
                    open
                    header={{ heading: 'Ønsker du å fjerne brevmottaker(e)?', size: 'medium' }}
                    portal={true}
                    width="small"
                    onClose={() => {
                        settVisFjernModal(false);
                    }}
                >
                    <Modal.Body>
                        <div>
                            Dette vil både fjerne eventuelt registrerte brevmottakere og fjerne
                            steget &quot;Brevmottaker(e)&quot;.
                        </div>
                        {feilmelding && feilmelding !== '' && (
                            <div className="skjemaelement__feilmelding">
                                <ErrorMessage size="small">{feilmelding}</ErrorMessage>
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="primary"
                            key={'bekreft'}
                            disabled={senderInn}
                            loading={senderInn}
                            onClick={() => fjernBrevmottakerSteg()}
                            size="small"
                        >
                            Ja, fjern
                        </Button>
                        <Button
                            variant="tertiary"
                            key={'avbryt'}
                            onClick={() => {
                                settVisFjernModal(false);
                            }}
                            size="small"
                        >
                            Nei, behold
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </>
    );
};

export default LeggTilFjernBrevmottakere;
