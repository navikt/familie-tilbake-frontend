import type { FormData } from './BrevmottakerForm';
import type { IBehandling } from '../../../typer/behandling';
import type { IFagsak } from '../../../typer/fagsak';

import React from 'react';

import { EndreBrevmottakerModal } from './EndreBrevmottakerModal';
import { LeggTilBrevmottakerModal } from './LeggTilBrevmottakerModal';
import { useBehandling } from '../../../context/BehandlingContext';
import { useFagsak } from '../../../context/FagsakContext';
import { MottakerType, type IBrevmottaker } from '../../../typer/Brevmottaker';
import { type Ressurs, RessursStatus } from '../../../typer/ressurs';

const hentEksisterendeBrevmottaker = (
    brevmottakerIdTilEndring: string,
    behandling: Ressurs<IBehandling> | undefined,
    fagsak: Ressurs<IFagsak> | undefined
): IBrevmottaker | undefined => {
    if (behandling?.status === RessursStatus.Suksess && fagsak?.status === RessursStatus.Suksess) {
        if (brevmottakerIdTilEndring === 'default-user') {
            return {
                type: MottakerType.Bruker,
                navn: fagsak.data.bruker.navn,
                personIdent: fagsak.data.bruker.personIdent,
                isDefault: true,
            } as IBrevmottaker & { isDefault: boolean };
        } else {
            const manuellMottaker = behandling.data.manuelleBrevmottakere.find(
                (m: { id: string; brevmottaker: IBrevmottaker }) =>
                    m.id === brevmottakerIdTilEndring
            );
            if (manuellMottaker) {
                return manuellMottaker.brevmottaker;
            }
        }
    }
    return undefined;
};

const konverterTilFormData = (eksisterendeMottaker: IBrevmottaker): Partial<FormData> => {
    const formData: Partial<FormData> = {
        mottakerType: eksisterendeMottaker.type,
    };

    const adresseInfo = eksisterendeMottaker.manuellAdresseInfo;
    const fellesAdresseData = {
        navn: eksisterendeMottaker.navn,
        land: adresseInfo?.landkode || '',
        adresselinje1: adresseInfo?.adresselinje1 || '',
        adresselinje2: adresseInfo?.adresselinje2 || '',
        postnummer: adresseInfo?.postnummer || '',
        poststed: adresseInfo?.poststed || '',
    };

    switch (eksisterendeMottaker.type) {
        case MottakerType.BrukerMedUtenlandskAdresse:
            formData.brukerMedUtenlandskAdresse = fellesAdresseData;
            break;
        case MottakerType.Fullmektig:
            formData.fullmektig = {
                ...fellesAdresseData,
                adresseKilde: 'MANUELL_REGISTRERING',
                personnummer: eksisterendeMottaker.personIdent || '',
                organisasjonsnummer: eksisterendeMottaker.organisasjonsnummer || '',
            };
            break;
        case MottakerType.Verge:
            formData.verge = {
                ...fellesAdresseData,
                vergetype: eksisterendeMottaker.vergetype || '',
                adresseKilde: 'MANUELL_REGISTRERING',
                personnummer: eksisterendeMottaker.personIdent || '',
                organisasjonsnummer: eksisterendeMottaker.organisasjonsnummer || '',
            };
            break;
        case MottakerType.Dødsbo:
            formData.dødsbo = fellesAdresseData;
            break;
    }

    return formData;
};

interface BrevmottakerModalWrapperProps {
    mode: 'endre' | 'leggTil';
    eksisterendeMottaker?: Partial<FormData>;
    mottakerId?: string;
}

export const BrevmottakerModalWrapper: React.FC<BrevmottakerModalWrapperProps> = ({
    mode,
    eksisterendeMottaker,
    mottakerId,
}) => {
    if (mode === 'endre' && eksisterendeMottaker) {
        return (
            <EndreBrevmottakerModal
                eksisterendeMottaker={eksisterendeMottaker}
                mottakerId={mottakerId}
            />
        );
    }

    return <LeggTilBrevmottakerModal />;
};
export const LeggTilEndreBrevmottakerModal: React.FC = () => {
    const { visBrevmottakerModal, brevmottakerIdTilEndring, behandling } = useBehandling();
    const { fagsak } = useFagsak();

    if (!visBrevmottakerModal) {
        return null;
    }

    if (brevmottakerIdTilEndring) {
        const eksisterendeMottaker = hentEksisterendeBrevmottaker(
            brevmottakerIdTilEndring,
            behandling,
            fagsak
        );

        if (eksisterendeMottaker) {
            const formData = konverterTilFormData(eksisterendeMottaker);
            return (
                <BrevmottakerModalWrapper
                    mode="endre"
                    eksisterendeMottaker={formData}
                    mottakerId={brevmottakerIdTilEndring}
                />
            );
        }
    }

    return <BrevmottakerModalWrapper mode="leggTil" />;
};
