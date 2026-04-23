import type { FC } from 'react';

import { PersonPlusIcon } from '@navikt/aksel-icons';
import { ActionMenu, BodyLong, Button, ErrorMessage, Modal } from '@navikt/ds-react';
import { useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';

import { useHttp } from '~/api/http/HttpProvider';
import { useApp } from '~/context/AppContext';
import { useBehandling } from '~/context/BehandlingContext';
import { useBehandlingState } from '~/context/BehandlingStateContext';
import { hentBehandlingQueryKey } from '~/generated/@tanstack/react-query.gen';
import { AlertType, ToastTyper } from '~/komponenter/toast/typer';
import { type Ressurs, RessursStatus } from '~/typer/ressurs';
import { useStegNavigering } from '~/utils/sider';

import { MODAL_BREDDE } from '../utils';

export const LeggTilFjernBrevmottakere: FC = () => {
    const { behandlingId, manuelleBrevmottakere, behandlingsstegsinfo } = useBehandling();
    const { nullstillIkkePersisterteKomponenter } = useBehandlingState();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [senderInn, setSenderInn] = useState(false);
    const [feilmelding, setFeilmelding] = useState('');
    const navigerTilBrevmottakerSteg = useStegNavigering('BREVMOTTAKER');
    const navigerTilBehandling = useStegNavigering();
    const queryClient = useQueryClient();
    const { request } = useHttp();
    const { setToast } = useApp();

    const kanFjerneManuelleBrevmottakere =
        manuelleBrevmottakere.length ||
        behandlingsstegsinfo.some(
            steg =>
                steg.behandlingssteg === 'BREVMOTTAKER' &&
                steg.behandlingsstegstatus !== 'TILBAKEFØRT'
        );

    const opprettBrevmottakerSteg = (): void => {
        nullstillIkkePersisterteKomponenter();
        setSenderInn(true);
        request<void, string>({
            method: 'POST',
            url: `/familie-tilbake/api/brevmottaker/manuell/${behandlingId}/aktiver`,
        }).then(async (respons: Ressurs<string>) => {
            setSenderInn(false);
            if (respons.status === RessursStatus.Suksess) {
                await queryClient.invalidateQueries({
                    queryKey: hentBehandlingQueryKey({ path: { behandlingId: behandlingId } }),
                });
                navigerTilBrevmottakerSteg();
            } else if (
                respons.status === RessursStatus.Feilet ||
                respons.status === RessursStatus.FunksjonellFeil ||
                respons.status === RessursStatus.IkkeTilgang
            ) {
                setFeilmelding(respons.frontendFeilmelding);
                setToast(ToastTyper.BrevmottakerIkkeTillat, {
                    alertType: AlertType.Warning,
                    tekst: respons.frontendFeilmelding,
                });
            }
        });
    };

    const fjernBrevmottakerSteg = (): void => {
        nullstillIkkePersisterteKomponenter();
        setSenderInn(true);
        request<void, string>({
            method: 'PUT',
            url: `/familie-tilbake/api/brevmottaker/manuell/${behandlingId}/deaktiver`,
        }).then(async (respons: Ressurs<string>) => {
            setSenderInn(false);
            if (respons.status === RessursStatus.Suksess) {
                dialogRef.current?.close();
                await queryClient.refetchQueries({
                    queryKey: hentBehandlingQueryKey({ path: { behandlingId: behandlingId } }),
                });
                navigerTilBehandling();
            } else if (
                respons.status === RessursStatus.Feilet ||
                respons.status === RessursStatus.FunksjonellFeil ||
                respons.status === RessursStatus.IkkeTilgang
            ) {
                setFeilmelding(respons.frontendFeilmelding);
                setToast(ToastTyper.BrevmottakerIkkeTillat, {
                    alertType: AlertType.Warning,
                    tekst: respons.frontendFeilmelding,
                });
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
