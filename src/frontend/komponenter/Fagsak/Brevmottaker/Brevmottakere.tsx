import { PencilIcon, PlusCircleIcon, TrashIcon } from '@navikt/aksel-icons';
import { Button, Heading } from '@navikt/ds-react';
import * as React from 'react';
import { useNavigate } from 'react-router';

import { BrevmottakerModal } from './BrevmottakerModal';
import { useBehandlingApi } from '../../../api/behandling';
import { useBehandling } from '../../../context/BehandlingContext';
import { useFagsak } from '../../../context/FagsakContext';
import {
    MottakerType,
    mottakerTypeVisningsnavn,
    type IBrevmottaker,
} from '../../../typer/Brevmottaker';
import { RessursStatus, type Ressurs } from '../../../typer/ressurs';
import { norskLandnavn } from '../../../utils/land';
import { sider } from '../../Felleskomponenter/Venstremeny/sider';

interface IBrevmottakerProps {
    brevmottaker: IBrevmottaker & { isDefault?: boolean };
    brevmottakerId: string;
    behandlingId: string;
    erLesevisning: boolean;
    antallBrevmottakere: number;
}

const Brevmottaker: React.FC<IBrevmottakerProps> = ({
    brevmottaker,
    brevmottakerId,
    behandlingId,
    erLesevisning,
    antallBrevmottakere,
}) => {
    const {
        hentBehandlingMedBehandlingId,
        settVisBrevmottakerModal,
        settBrevmottakerIdTilEndring,
    } = useBehandling();
    const { fjernManuellBrevmottaker } = useBehandlingApi();

    const landnavn = brevmottaker.manuellAdresseInfo
        ? norskLandnavn(brevmottaker.manuellAdresseInfo.landkode)
        : undefined;
    const [organisasjonsnavn, kontaktperson] = brevmottaker.navn.split(' v/ ');

    const erDefaultBruker = brevmottakerId === 'default-user' || brevmottaker.isDefault;

    const fjernBrevMottakerOgOppdaterState = (mottakerId: string): void => {
        fjernManuellBrevmottaker(behandlingId, mottakerId).then((respons: Ressurs<string>) => {
            if (respons.status === RessursStatus.Suksess) {
                hentBehandlingMedBehandlingId(behandlingId);
            }
        });
    };

    const håndterEndreBrevmottaker = (): void => {
        settBrevmottakerIdTilEndring(brevmottakerId);
        settVisBrevmottakerModal(true);
    };

    return (
        <div>
            <div>
                <Heading size="medium">{mottakerTypeVisningsnavn[brevmottaker.type]}</Heading>
                {!erLesevisning && !erDefaultBruker && (
                    <Button
                        variant="tertiary"
                        onClick={() => fjernBrevMottakerOgOppdaterState(brevmottakerId)}
                        size="small"
                        icon={<TrashIcon />}
                    >
                        Fjern
                    </Button>
                )}
            </div>
            <dl>
                {brevmottaker.organisasjonsnummer ? (
                    <>
                        {kontaktperson && (
                            <>
                                <dt>Kontaktperson</dt>
                                <dd>{kontaktperson}</dd>
                            </>
                        )}
                        <dt>Organisasjonsnummer</dt>
                        <dd>{brevmottaker.organisasjonsnummer}</dd>
                        <dt>Organisasjonsnavn</dt>
                        <dd>{organisasjonsnavn}</dd>
                    </>
                ) : (
                    <>
                        <dt>Navn</dt>
                        <dd>{brevmottaker.navn}</dd>
                    </>
                )}
                {brevmottaker.personIdent && (
                    <>
                        <dt>Fødselsnummer</dt>
                        <dd>{brevmottaker.personIdent}</dd>
                    </>
                )}
                {brevmottaker.manuellAdresseInfo && (
                    <>
                        <dt>Adresselinje 1</dt>
                        <dd>{brevmottaker.manuellAdresseInfo?.adresselinje1}</dd>
                        <dt>Adresselinje 2</dt>
                        <dd>{brevmottaker.manuellAdresseInfo?.adresselinje2 || '-'}</dd>
                        <dt>Postnummer</dt>
                        <dd>{brevmottaker.manuellAdresseInfo?.postnummer || '-'}</dd>
                        <dt>Poststed</dt>
                        <dd>{brevmottaker.manuellAdresseInfo?.poststed || '-'}</dd>
                        <dt>Land</dt>
                        <dd>{landnavn}</dd>
                    </>
                )}
            </dl>
            {!erLesevisning && !erDefaultBruker && (
                <Button
                    variant="tertiary"
                    onClick={() => {
                        håndterEndreBrevmottaker();
                    }}
                    size="small"
                    icon={<PencilIcon />}
                >
                    Endre
                </Button>
            )}

            {!erLesevisning && erDefaultBruker && antallBrevmottakere > 1 && (
                <Button
                    variant="tertiary"
                    size="small"
                    icon={<PencilIcon />}
                    onClick={() => {
                        håndterEndreBrevmottaker();
                    }}
                >
                    Endre
                </Button>
            )}
        </div>
    );
};

const Brevmottakere: React.FC = () => {
    const {
        behandling,
        behandlingILesemodus,
        visBrevmottakerModal,
        settVisBrevmottakerModal,
        settBrevmottakerIdTilEndring,
    } = useBehandling();
    const { fagsak } = useFagsak();
    const navigate = useNavigate();

    const erLesevisning = !!behandlingILesemodus;

    const brevmottakere: { [id: string]: IBrevmottaker } = {};

    if (behandling?.status === 'SUKSESS' && fagsak?.status === 'SUKSESS') {
        brevmottakere['default-user'] = {
            type: MottakerType.Bruker,
            navn: fagsak.data.bruker.navn,
            personIdent: fagsak.data.bruker.personIdent,
            isDefault: true,
        } as IBrevmottaker & { isDefault: boolean };

        behandling.data.manuelleBrevmottakere.forEach(value => {
            brevmottakere[value.id] = value.brevmottaker;
        });
    }

    const antallBrevmottakere = Object.keys(brevmottakere).length;

    const gåTilNeste = (): void => {
        if (behandling?.status === 'SUKSESS' && fagsak?.status === 'SUKSESS') {
            navigate(
                `/fagsystem/${fagsak.data.fagsystem}/fagsak/${fagsak.data.eksternFagsakId}/behandling/${behandling.data.eksternBrukId}/${sider.FAKTA.href}`
            );
        }
    };

    if (behandling?.status !== 'SUKSESS' || fagsak?.status !== 'SUKSESS') {
        return null; // eller loading spinner
    }

    return (
        <div>
            {visBrevmottakerModal && <BrevmottakerModal />}
            <div>
                <Heading size="large" level="1">
                    Brevmottaker(e)
                </Heading>
                <div>
                    {Object.keys(brevmottakere)
                        .sort((a, b) => brevmottakere[a].type.localeCompare(brevmottakere[b].type))
                        .map(id => (
                            <div key={id}>
                                <Brevmottaker
                                    brevmottaker={brevmottakere[id]}
                                    brevmottakerId={id}
                                    behandlingId={behandling.data.behandlingId}
                                    erLesevisning={erLesevisning}
                                    antallBrevmottakere={antallBrevmottakere}
                                />
                                {antallBrevmottakere == 1 &&
                                    !erLesevisning &&
                                    MottakerType.Dødsbo !== brevmottakere[id].type && (
                                        <Button
                                            variant="tertiary"
                                            size="small"
                                            icon={<PlusCircleIcon />}
                                            onClick={() => {
                                                settBrevmottakerIdTilEndring(undefined);
                                                settVisBrevmottakerModal(true);
                                            }}
                                        >
                                            Legg til ny mottaker
                                        </Button>
                                    )}
                            </div>
                        ))}
                </div>
                <Button variant="primary" onClick={gåTilNeste}>
                    Neste
                </Button>
            </div>
        </div>
    );
};

export default Brevmottakere;
