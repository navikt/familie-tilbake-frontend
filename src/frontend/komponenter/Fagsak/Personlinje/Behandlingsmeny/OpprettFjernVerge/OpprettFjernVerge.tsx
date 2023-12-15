import * as React from 'react';

import { ErrorMessage, Modal } from '@navikt/ds-react';
import { useHttp } from '@navikt/familie-http';
import { type Ressurs, RessursStatus } from '@navikt/familie-typer';

import { useBehandling } from '../../../../../context/BehandlingContext';
import { Behandlingssteg, IBehandling } from '../../../../../typer/behandling';
import { BehandlingsMenyButton, FTButton } from '../../../../Felleskomponenter/Flytelementer';

interface IProps {
    behandling: IBehandling;
    onListElementClick: () => void;
}

const OpprettFjernVerge: React.FC<IProps> = ({ behandling, onListElementClick }) => {
    const [visModal, settVisModal] = React.useState<boolean>(false);
    const [senderInn, settSenderInn] = React.useState<boolean>(false);
    const [feilmelding, settFeilmelding] = React.useState<string>();
    const { hentBehandlingMedBehandlingId, aktivtSteg, behandlingILesemodus } = useBehandling();
    const { request } = useHttp();

    const kanFjerneVerge =
        behandling.harVerge || aktivtSteg?.behandlingssteg === Behandlingssteg.VERGE;

    const opprettVerge = () => {
        request<void, string>({
            method: 'POST',
            url: `/familie-tilbake/api/behandling/v1/${behandling.behandlingId}/verge`,
        }).then((respons: Ressurs<string>) => {
            if (respons.status === RessursStatus.SUKSESS) {
                settSenderInn(false);
                settVisModal(false);
                hentBehandlingMedBehandlingId(behandling.behandlingId, true);
            } else if (
                respons.status === RessursStatus.FEILET ||
                respons.status === RessursStatus.FUNKSJONELL_FEIL ||
                respons.status === RessursStatus.IKKE_TILGANG
            ) {
                settFeilmelding(respons.frontendFeilmelding);
            }
        });
    };

    const fjernVerge = () => {
        request<void, string>({
            method: 'PUT',
            url: `/familie-tilbake/api/behandling/v1/${behandling.behandlingId}/verge`,
        }).then((respons: Ressurs<string>) => {
            if (respons.status === RessursStatus.SUKSESS) {
                settSenderInn(false);
                settVisModal(false);
                hentBehandlingMedBehandlingId(behandling.behandlingId, true);
            } else if (
                respons.status === RessursStatus.FEILET ||
                respons.status === RessursStatus.FUNKSJONELL_FEIL ||
                respons.status === RessursStatus.IKKE_TILGANG
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
                        <FTButton
                            variant="primary"
                            key={'bekreft'}
                            disabled={senderInn}
                            loading={senderInn}
                            onClick={() => opprettEllerFjern()}
                            size="small"
                        >
                            Ok
                        </FTButton>
                        <FTButton
                            variant="tertiary"
                            key={'avbryt'}
                            onClick={() => {
                                settVisModal(false);
                            }}
                            size="small"
                        >
                            Avbryt
                        </FTButton>
                    </Modal.Footer>
                </Modal>
            )}
        </>
    );
};

export default OpprettFjernVerge;
