import type { IBrevmottaker } from '../../../typer/Brevmottaker';

import { PencilIcon, TrashIcon } from '@navikt/aksel-icons';
import { Button, Heading } from '@navikt/ds-react';
import React from 'react';

import { useBehandlingApi } from '../../../api/behandling';
import { useBehandling } from '../../../context/BehandlingContext';
import { mottakerTypeVisningsnavn } from '../../../typer/Brevmottaker';
import { RessursStatus, type Ressurs } from '../../../typer/ressurs';
import { norskLandnavn } from '../../../utils/land';

interface IProps {
    brevmottaker: IBrevmottaker & { isDefault?: boolean };
    brevmottakerId: string;
    behandlingId: string;
    erLesevisning: boolean;
    antallBrevmottakere: number;
}

const Brevmottaker: React.FC<IProps> = ({
    brevmottaker,
    brevmottakerId,
    behandlingId,
    erLesevisning,
    antallBrevmottakere,
}) => {
    const { hentBehandlingMedBehandlingId } = useBehandling();
    const { fjernManuellBrevmottaker } = useBehandlingApi();
    const { settVisBrevmottakerModal } = useBehandling();

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
        // MERK: brevmottakerIdTilEndring håndteres nå ikke lenger siden vi fjernet contexten.
        // Modal-komponenten må refaktoreres til å få denne informasjonen på en annen måte,
        // f.eks. som prop eller via URL-parameter.
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

export default Brevmottaker;
