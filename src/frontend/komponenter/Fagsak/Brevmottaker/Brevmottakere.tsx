import type { IBehandling } from '../../../typer/behandling';
import type { IBrevmottaker } from '../../../typer/Brevmottaker';
import type { IFagsak } from '../../../typer/fagsak';

import { PencilIcon, PlusCircleIcon, TrashIcon } from '@navikt/aksel-icons';
import { BodyShort, Box, Button, Heading, VStack } from '@navikt/ds-react';
import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { BrevmottakerModal } from './BrevmottakerModal';
import { useBehandlingApi } from '../../../api/behandling';
import { useBehandling } from '../../../context/BehandlingContext';
import { Behandlingssteg } from '../../../typer/behandling';
import { MottakerType, mottakerTypeVisningsnavn } from '../../../typer/Brevmottaker';
import { RessursStatus, type Ressurs } from '../../../typer/ressurs';
import { norskLandnavn } from '../../../utils/land';
import { SYNLIGE_STEG } from '../../../utils/sider';
import { ActionBar } from '../ActionBar/ActionBar';

export type BrevmottakerProps = {
    brevmottaker: IBrevmottaker;
    erStandardMottaker?: boolean;
    brevmottakerId: string;
    behandlingId: string;
    erLesevisning: boolean;
    antallBrevmottakere: number;
    settVisBrevmottakerModal: (vis: boolean) => void;
    settBrevmottakerIdTilEndring: (id: string | undefined) => void;
};

const Brevmottaker: React.FC<BrevmottakerProps> = ({
    brevmottaker,
    brevmottakerId,
    erStandardMottaker,
    behandlingId,
    erLesevisning,
    antallBrevmottakere,
    settVisBrevmottakerModal,
    settBrevmottakerIdTilEndring,
}) => {
    const { hentBehandlingMedBehandlingId } = useBehandling();
    const { fjernManuellBrevmottaker } = useBehandlingApi();

    const landnavn = brevmottaker.manuellAdresseInfo
        ? norskLandnavn(brevmottaker.manuellAdresseInfo.landkode)
        : undefined;
    const [organisasjonsnavn, kontaktperson] = brevmottaker.navn.split(' v/ ');

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
                    {!erLesevisning && !erStandardMottaker && (
                        <>
                            <Button
                                variant="tertiary"
                                onClick={() => fjernBrevMottakerOgOppdaterState(brevmottakerId)}
                                size="small"
                                icon={<TrashIcon />}
                            >
                                Fjern
                            </Button>
                            <Button
                                variant="tertiary"
                                onClick={håndterEndreBrevmottaker}
                                size="small"
                                icon={<PencilIcon />}
                            >
                                Endre
                            </Button>
                        </>
                    )}
                    {!erLesevisning && erStandardMottaker && antallBrevmottakere > 1 && (
                        <Button
                            variant="tertiary"
                            size="small"
                            icon={<PencilIcon />}
                            onClick={håndterEndreBrevmottaker}
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
                            <BodyShort
                                size="small"
                                aria-label={brevmottaker.personIdent?.split('').join(' ')}
                            >
                                {brevmottaker.personIdent}
                            </BodyShort>
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
                                {brevmottaker.manuellAdresseInfo.adresselinje1}
                            </BodyShort>
                        </dd>
                        {brevmottaker.manuellAdresseInfo.adresselinje2 && (
                            <>
                                <dt>
                                    <BodyShort size="small" weight="semibold">
                                        Adresselinje 2
                                    </BodyShort>
                                </dt>
                                <dd>
                                    <BodyShort size="small">
                                        {brevmottaker.manuellAdresseInfo.adresselinje2}
                                    </BodyShort>
                                </dd>
                            </>
                        )}
                        {brevmottaker.manuellAdresseInfo.postnummer && (
                            <>
                                <dt>
                                    <BodyShort size="small" weight="semibold">
                                        Postnummer
                                    </BodyShort>
                                </dt>
                                <dd>
                                    <BodyShort size="small">
                                        {brevmottaker.manuellAdresseInfo.postnummer}
                                    </BodyShort>
                                </dd>
                            </>
                        )}
                        {brevmottaker.manuellAdresseInfo.poststed && (
                            <>
                                <dt>
                                    <BodyShort size="small" weight="semibold">
                                        Poststed
                                    </BodyShort>
                                </dt>
                                <dd>
                                    <BodyShort size="small">
                                        {brevmottaker.manuellAdresseInfo.poststed}
                                    </BodyShort>
                                </dd>
                            </>
                        )}
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

type BrevmottakereProps = {
    behandling: IBehandling;
    fagsak: IFagsak;
};

const Brevmottakere: React.FC<BrevmottakereProps> = ({ behandling, fagsak }) => {
    const { behandlingILesemodus, actionBarStegtekst, harVærtPåFatteVedtakSteget } =
        useBehandling();
    const navigate = useNavigate();

    const [visBrevmottakerModal, setVisBrevmottakerModal] = useState(false);
    const [brevmottakerIdTilEndring, setBrevmottakerIdTilEndring] = useState<string | undefined>(
        undefined
    );

    const erLesevisning = !!behandlingILesemodus;

    const { manuelleBrevmottakere } = behandling;

    const antallBrevmottakere = Object.keys(manuelleBrevmottakere).length;

    const gåTilNeste = (): void => {
        navigate(
            `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}/${SYNLIGE_STEG.FAKTA.href}`
        );
    };

    const kanLeggeTilMottaker =
        antallBrevmottakere == 0 &&
        !erLesevisning &&
        !manuelleBrevmottakere.some(
            manuellBrevmottaker => manuellBrevmottaker.brevmottaker.type === MottakerType.Dødsbo
        );

    return (
        <>
            {visBrevmottakerModal && (
                <BrevmottakerModal
                    visBrevmottakerModal={visBrevmottakerModal}
                    brevmottakerIdTilEndring={brevmottakerIdTilEndring}
                    behandlingId={behandling.behandlingId}
                    brevmottakere={manuelleBrevmottakere}
                    settVisBrevmottakerModal={setVisBrevmottakerModal}
                    settBrevmottakerIdTilEndring={setBrevmottakerIdTilEndring}
                />
            )}
            <VStack gap="4" align="start">
                <Heading size="small" level="1">
                    Brevmottaker(e)
                </Heading>
                <VStack gap="4" minWidth="430px">
                    <Box
                        borderWidth="1"
                        borderRadius="xlarge"
                        padding="4"
                        borderColor="border-divider"
                        key={fagsak.bruker.personIdent}
                    >
                        <Brevmottaker
                            brevmottaker={{
                                type: MottakerType.Bruker,
                                navn: fagsak.bruker.navn,
                                personIdent: fagsak.bruker.personIdent,
                            }}
                            erStandardMottaker
                            brevmottakerId={fagsak.bruker.personIdent}
                            behandlingId={behandling.behandlingId}
                            erLesevisning={erLesevisning}
                            antallBrevmottakere={antallBrevmottakere}
                            settVisBrevmottakerModal={setVisBrevmottakerModal}
                            settBrevmottakerIdTilEndring={setBrevmottakerIdTilEndring}
                        />
                    </Box>

                    {manuelleBrevmottakere.length > 0 &&
                        manuelleBrevmottakere.map(brevmottakerRespons => (
                            <Box
                                borderWidth="1"
                                borderRadius="xlarge"
                                padding="4"
                                borderColor="border-divider"
                                key={brevmottakerRespons.id}
                            >
                                <Brevmottaker
                                    brevmottaker={brevmottakerRespons.brevmottaker}
                                    brevmottakerId={brevmottakerRespons.id}
                                    behandlingId={behandling.behandlingId}
                                    erLesevisning={erLesevisning}
                                    antallBrevmottakere={antallBrevmottakere}
                                    settVisBrevmottakerModal={setVisBrevmottakerModal}
                                    settBrevmottakerIdTilEndring={setBrevmottakerIdTilEndring}
                                />
                            </Box>
                        ))}
                </VStack>
                {kanLeggeTilMottaker && (
                    <Button
                        variant="tertiary"
                        size="small"
                        icon={<PlusCircleIcon />}
                        onClick={() => {
                            setBrevmottakerIdTilEndring(undefined);
                            setVisBrevmottakerModal(true);
                        }}
                    >
                        Legg til ny mottaker
                    </Button>
                )}
            </VStack>

            <ActionBar
                stegtekst={actionBarStegtekst(Behandlingssteg.Brevmottaker)}
                forrigeTekst={undefined}
                nesteTekst="Neste"
                forrigeAriaLabel={undefined}
                nesteAriaLabel="Gå til faktasteget"
                åpenHøyremeny={false}
                onNeste={gåTilNeste}
                onForrige={undefined}
                harVærtPåFatteVedtakSteg={harVærtPåFatteVedtakSteget()}
            />
        </>
    );
};

export default Brevmottakere;
