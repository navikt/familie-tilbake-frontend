import type { IBehandling } from '../../../../../typer/behandling';
import type { IFagsak } from '../../../../../typer/fagsak';

import { Button, ErrorMessage, Modal } from '@navikt/ds-react';
import * as React from 'react';

import { useHttp } from '../../../../../api/http/HttpProvider';
import { useBehandling } from '../../../../../context/BehandlingContext';
import { useRedirectEtterLagring } from '../../../../../hooks/useRedirectEtterLagring';
import { Behandlingssteg } from '../../../../../typer/behandling';
import { type Ressurs, RessursStatus } from '../../../../../typer/ressurs';
import { BehandlingsMenyButton } from '../../../../Felleskomponenter/Flytelementer';

interface IProps {
    behandling: IBehandling;
    fagsak: IFagsak;
    onListElementClick: () => void;
}

const OpprettFjernVerge: React.FC<IProps> = ({ behandling, fagsak, onListElementClick }) => {
    const [visModal, settVisModal] = React.useState<boolean>(false);
    const [senderInn, settSenderInn] = React.useState<boolean>(false);
    const [feilmelding, settFeilmelding] = React.useState<string>();
    const {
        hentBehandlingMedBehandlingId,
        aktivtSteg,
        behandlingILesemodus,
        nullstillIkkePersisterteKomponenter,
    } = useBehandling();
    const { request } = useHttp();
    const { utførRedirect } = useRedirectEtterLagring();

    const kanFjerneVerge =
        behandling.harVerge || aktivtSteg?.behandlingssteg === Behandlingssteg.Verge;

    const opprettVerge = () => {
        nullstillIkkePersisterteKomponenter();
        request<void, string>({
            method: 'POST',
            url: `/familie-tilbake/api/behandling/v1/${behandling.behandlingId}/verge`,
        }).then((respons: Ressurs<string>) => {
            if (respons.status === RessursStatus.Suksess) {
                settSenderInn(false);
                settVisModal(false);
                hentBehandlingMedBehandlingId(behandling.behandlingId).then(() => {
                    utførRedirect(
                        `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}`
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

    const fjernVerge = () => {
        nullstillIkkePersisterteKomponenter();
        request<void, string>({
            method: 'PUT',
            url: `/familie-tilbake/api/behandling/v1/${behandling.behandlingId}/verge`,
        }).then((respons: Ressurs<string>) => {
            if (respons.status === RessursStatus.Suksess) {
                settSenderInn(false);
                settVisModal(false);
                hentBehandlingMedBehandlingId(behandling.behandlingId).then(() => {
                    utførRedirect(
                        `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}`
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

    const opprettEllerFjern = () => {
        settSenderInn(true);
        if (kanFjerneVerge) {
            fjernVerge();
        } else {
            opprettVerge();
        }
    };

    return (
        <>
            <BehandlingsMenyButton
                variant="tertiary"
                onClick={() => {
                    settVisModal(true);
                    onListElementClick();
                }}
                disabled={!behandling.kanEndres || behandlingILesemodus}
            >
                {kanFjerneVerge ? 'Fjern verge/fullmektig' : 'Opprett verge/fullmektig'}
            </BehandlingsMenyButton>

            {visModal && (
                <Modal
                    open
                    header={{
                        heading: kanFjerneVerge
                            ? 'Fjern verge/fullmektig?'
                            : 'Opprett verge/fullmektig?',
                        size: 'medium',
                    }}
                    portal={true}
                    width="small"
                    onClose={() => {
                        settVisModal(false);
                    }}
                >
                    <Modal.Body>
                        {feilmelding && feilmelding !== '' && (
                            <div className="skjemaelement__feilmelding">
                                <ErrorMessage size="small">{feilmelding}</ErrorMessage>
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="primary"
                            key="bekreft"
                            disabled={senderInn}
                            loading={senderInn}
                            onClick={() => opprettEllerFjern()}
                            size="small"
                        >
                            Ok
                        </Button>
                        <Button
                            variant="tertiary"
                            key="avbryt"
                            onClick={() => {
                                settVisModal(false);
                            }}
                            size="small"
                        >
                            Avbryt
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </>
    );
};

export default OpprettFjernVerge;
