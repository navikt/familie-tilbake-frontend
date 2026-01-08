import type { Behandling } from '../../../../typer/behandling';

import { PersonPlusIcon } from '@navikt/aksel-icons';
import { ActionMenu, BodyLong, Button, ErrorMessage, Modal } from '@navikt/ds-react';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { useHttp } from '../../../../api/http/HttpProvider';
import { useApp } from '../../../../context/AppContext';
import { useBehandling } from '../../../../context/BehandlingContext';
import { useFagsak } from '../../../../context/FagsakContext';
import { useRedirectEtterLagring } from '../../../../hooks/useRedirectEtterLagring';
import { Behandlingssteg, Behandlingsstegstatus } from '../../../../typer/behandling';
import { type Ressurs, RessursStatus } from '../../../../typer/ressurs';
import { SYNLIGE_STEG } from '../../../../utils/sider';
import { AlertType, ToastTyper } from '../../../Felleskomponenter/Toast/typer';
import { MODAL_BREDDE } from '../utils';

type Props = {
    behandling: Behandling;
};

export const LeggTilFjernBrevmottakere: React.FC<Props> = ({ behandling }) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [senderInn, settSenderInn] = useState(false);
    const [feilmelding, settFeilmelding] = useState('');
    const {
        hentBehandlingMedBehandlingId,
        settVisBrevmottakerModal,
        nullstillIkkePersisterteKomponenter,
    } = useBehandling();

    const { fagsystem, eksternFagsakId } = useFagsak();
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
                dialogRef.current?.close();
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
            dialogRef.current?.showModal();
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
        <>
            <ActionMenu.Item
                onSelect={opprettEllerFjernSteg}
                className="text-xl cursor-pointer"
                icon={<PersonPlusIcon aria-hidden />}
            >
                <span className="ml-1">
                    {kanFjerneManuelleBrevmottakere
                        ? 'Fjern brevmottaker(e)'
                        : 'Legg til brevmottaker'}
                </span>
            </ActionMenu.Item>

            <Modal
                ref={dialogRef}
                header={{ heading: 'Ønsker du å fjerne brevmottaker(e)?' }}
                className={MODAL_BREDDE}
            >
                <Modal.Body>
                    <BodyLong>
                        Dette vil fjerne registrerte brevmottakere og steget
                        &quot;Brevmottaker(e)&quot;.
                    </BodyLong>
                    {feilmelding !== '' && <ErrorMessage size="small">{feilmelding}</ErrorMessage>}
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        key="bekreft"
                        disabled={senderInn}
                        loading={senderInn}
                        onClick={fjernBrevmottakerSteg}
                    >
                        Fjern
                    </Button>
                    <Button
                        variant="secondary"
                        key="avbryt"
                        onClick={() => dialogRef.current?.close()}
                    >
                        Avbryt
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};
