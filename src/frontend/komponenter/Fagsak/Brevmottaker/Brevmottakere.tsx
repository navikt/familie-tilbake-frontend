import type { Brevmottaker as TBrevmottaker } from '../../../typer/Brevmottaker';

import { PencilIcon, PlusCircleIcon, TrashIcon } from '@navikt/aksel-icons';
import { BodyShort, Box, Button, Heading, VStack } from '@navikt/ds-react';
import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { useState } from 'react';

import { BrevmottakerModal } from './BrevmottakerModal';
import { useBehandlingApi } from '../../../api/behandling';
import { useBehandling } from '../../../context/BehandlingContext';
import { useBehandlingState } from '../../../context/BehandlingStateContext';
import { useFagsak } from '../../../context/FagsakContext';
import { hentBehandlingQueryKey } from '../../../generated/@tanstack/react-query.gen';
import { Behandlingssteg } from '../../../typer/behandling';
import { MottakerType, mottakerTypeVisningsnavn } from '../../../typer/Brevmottaker';
import { RessursStatus, type Ressurs } from '../../../typer/ressurs';
import { norskLandnavn } from '../../../utils/land';
import { useStegNavigering } from '../../../utils/sider';
import { ActionBar } from '../ActionBar/ActionBar';

export type BrevmottakerProps = {
    brevmottaker: TBrevmottaker;
    erStandardMottaker?: boolean;
    brevmottakerId: string;
    antallBrevmottakere: number;
    settVisBrevmottakerModal: (vis: boolean) => void;
    settBrevmottakerIdTilEndring: (id: string | undefined) => void;
};

const Brevmottaker: React.FC<BrevmottakerProps> = ({
    brevmottaker,
    brevmottakerId,
    erStandardMottaker,
    antallBrevmottakere,
    settVisBrevmottakerModal,
    settBrevmottakerIdTilEndring,
}) => {
    const { behandlingId } = useBehandling();
    const queryClient = useQueryClient();
    const { fjernManuellBrevmottaker } = useBehandlingApi();
    const { behandlingILesemodus } = useBehandlingState();
    const landnavn = brevmottaker.manuellAdresseInfo
        ? norskLandnavn(brevmottaker.manuellAdresseInfo.landkode)
        : undefined;
    const [organisasjonsnavn, kontaktperson] = brevmottaker.navn.split(' v/ ');

    const fjernBrevMottakerOgOppdaterState = (mottakerId: string): void => {
        fjernManuellBrevmottaker(behandlingId, mottakerId).then(
            async (respons: Ressurs<string>) => {
                if (respons.status === RessursStatus.Suksess) {
                    await queryClient.invalidateQueries({
                        queryKey: hentBehandlingQueryKey({ path: { behandlingId } }),
                    });
                }
            }
        );
    };

    const håndterEndreBrevmottaker = (): void => {
        settBrevmottakerIdTilEndring(brevmottakerId);
        settVisBrevmottakerModal(true);
    };

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <BodyShort weight="semibold">
                    {mottakerTypeVisningsnavn[brevmottaker.type]}
                </BodyShort>
                <div className="flex gap-1">
                    {!behandlingILesemodus && !erStandardMottaker && (
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
                    {!behandlingILesemodus && erStandardMottaker && antallBrevmottakere > 1 && (
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

export const Brevmottakere: React.FC = () => {
    const { manuelleBrevmottakere } = useBehandling();
    const { behandlingILesemodus, actionBarStegtekst } = useBehandlingState();
    const { bruker } = useFagsak();
    const navigerTilNeste = useStegNavigering(Behandlingssteg.Fakta);
    const [visBrevmottakerModal, setVisBrevmottakerModal] = useState(false);
    const [brevmottakerIdTilEndring, setBrevmottakerIdTilEndring] = useState<string | undefined>(
        undefined
    );

    const antallBrevmottakere = Object.keys(manuelleBrevmottakere).length;

    const kanLeggeTilMottaker =
        antallBrevmottakere == 0 &&
        !behandlingILesemodus &&
        !manuelleBrevmottakere.some(
            manuellBrevmottaker => manuellBrevmottaker.brevmottaker.type === MottakerType.Dødsbo
        );

    return (
        <>
            {visBrevmottakerModal && (
                <BrevmottakerModal
                    visBrevmottakerModal={visBrevmottakerModal}
                    brevmottakerIdTilEndring={brevmottakerIdTilEndring}
                    brevmottakere={manuelleBrevmottakere}
                    settVisBrevmottakerModal={setVisBrevmottakerModal}
                    settBrevmottakerIdTilEndring={setBrevmottakerIdTilEndring}
                />
            )}
            <VStack gap="space-16" align="start">
                <Heading size="small">Brevmottaker(e)</Heading>
                <VStack gap="space-16" minWidth="430px">
                    <Box
                        borderWidth="1"
                        padding="space-16"
                        className="border-ax-border-neutral-subtle rounded-xl"
                        key={bruker.personIdent}
                    >
                        <Brevmottaker
                            brevmottaker={{
                                type: MottakerType.Bruker,
                                navn: bruker.navn,
                                personIdent: bruker.personIdent,
                            }}
                            erStandardMottaker
                            brevmottakerId={bruker.personIdent}
                            antallBrevmottakere={antallBrevmottakere}
                            settVisBrevmottakerModal={setVisBrevmottakerModal}
                            settBrevmottakerIdTilEndring={setBrevmottakerIdTilEndring}
                        />
                    </Box>

                    {manuelleBrevmottakere.length > 0 &&
                        manuelleBrevmottakere.map(brevmottakerRespons => (
                            <Box
                                borderWidth="1"
                                padding="space-16"
                                className="border-ax-border-neutral-subtle rounded-xl"
                                key={brevmottakerRespons.id}
                            >
                                <Brevmottaker
                                    brevmottaker={brevmottakerRespons.brevmottaker as TBrevmottaker}
                                    brevmottakerId={brevmottakerRespons.id}
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
                forrigeAriaLabel={undefined}
                nesteAriaLabel="Gå til faktasteget"
                onNeste={navigerTilNeste}
                onForrige={undefined}
            />
        </>
    );
};
