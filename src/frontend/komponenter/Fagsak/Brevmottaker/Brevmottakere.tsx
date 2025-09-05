import { PencilIcon, PlusCircleIcon, TrashIcon } from '@navikt/aksel-icons';
import { BodyShort, Box, Button, Heading, VStack } from '@navikt/ds-react';
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
        <>
            <div className="flex justify-between items-center mb-4">
                <BodyShort weight="semibold" size="medium">
                    {mottakerTypeVisningsnavn[brevmottaker.type]}
                </BodyShort>
                <div className="flex gap-1">
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
            </div>
            <dl>
                {brevmottaker.organisasjonsnummer ? (
                    <div className="px-4 sm:grid sm:grid-cols-2 sm:gap-2 sm:px-0">
                        {kontaktperson && (
                            <>
                                <dt>Kontaktperson</dt>
                                <dd>{kontaktperson}</dd>
                            </>
                        )}
                        <dt>
                            <BodyShort weight="semibold">Organisasjonsnummer</BodyShort>
                        </dt>
                        <dd>
                            <BodyShort size="small">{brevmottaker.organisasjonsnummer}</BodyShort>
                        </dd>
                        <dt>
                            <BodyShort weight="semibold">Organisasjonsnavn</BodyShort>
                        </dt>
                        <dd>
                            <BodyShort size="small">{organisasjonsnavn}</BodyShort>
                        </dd>
                    </div>
                ) : (
                    <div className="px-4 sm:grid sm:grid-cols-2 sm:gap-2 sm:px-0">
                        <dt>
                            <BodyShort size="small" weight="semibold">
                                Navn
                            </BodyShort>
                        </dt>
                        <dd>
                            <BodyShort size="small">{brevmottaker.navn}</BodyShort>
                        </dd>
                    </div>
                )}
                {brevmottaker.personIdent && (
                    <div className="px-4 sm:grid sm:grid-cols-2 sm:gap-2 sm:px-0">
                        <dt>
                            <BodyShort size="small" weight="semibold">
                                Fødselsnummer
                            </BodyShort>
                        </dt>
                        <dd>
                            <BodyShort size="small">{brevmottaker.personIdent}</BodyShort>
                        </dd>
                    </div>
                )}
                {brevmottaker.manuellAdresseInfo && (
                    <div className="px-4 sm:grid sm:grid-cols-2 sm:gap-2 sm:px-0">
                        <dt>
                            <BodyShort size="small" weight="semibold">
                                Adresselinje 1
                            </BodyShort>
                        </dt>
                        <dd>
                            <BodyShort size="small">
                                {brevmottaker.manuellAdresseInfo?.adresselinje1}
                            </BodyShort>
                        </dd>
                        <dt>
                            <BodyShort size="small" weight="semibold">
                                Adresselinje 2
                            </BodyShort>
                        </dt>
                        <dd>
                            <BodyShort size="small">
                                {brevmottaker.manuellAdresseInfo?.adresselinje2 || '-'}
                            </BodyShort>
                        </dd>
                        <dt>
                            <BodyShort size="small" weight="semibold">
                                Postnummer
                            </BodyShort>
                        </dt>
                        <dd>
                            <BodyShort size="small">
                                {brevmottaker.manuellAdresseInfo?.postnummer || '-'}
                            </BodyShort>
                        </dd>
                        <dt>
                            <BodyShort size="small" weight="semibold">
                                Poststed
                            </BodyShort>
                        </dt>
                        <dd>
                            <BodyShort size="small">
                                {brevmottaker.manuellAdresseInfo?.poststed || '-'}
                            </BodyShort>
                        </dd>
                        <dt>
                            <BodyShort size="small" weight="semibold">
                                Land
                            </BodyShort>
                        </dt>
                        <dd>
                            <BodyShort size="small">{landnavn}</BodyShort>
                        </dd>
                    </div>
                )}
            </dl>
        </>
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
        return null;
    }

    return (
        <>
            {visBrevmottakerModal && <BrevmottakerModal />}
            <VStack padding="space-24" gap="4">
                <Heading size="small" level="1">
                    Brevmottaker(e)
                </Heading>
                <VStack gap="4" maxWidth="430px">
                    {Object.keys(brevmottakere)
                        .sort((a, b) => brevmottakere[a].type.localeCompare(brevmottakere[b].type))
                        .map(id => (
                            <Box
                                borderWidth="1"
                                borderRadius="xlarge"
                                padding="4"
                                borderColor="border-divider"
                                key={id}
                            >
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
                            </Box>
                        ))}
                </VStack>
                <Button variant="primary" onClick={gåTilNeste}>
                    Neste
                </Button>
            </VStack>
        </>
    );
};

export default Brevmottakere;
