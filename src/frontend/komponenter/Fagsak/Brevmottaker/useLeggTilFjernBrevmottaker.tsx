import { useSkjema, useFelt, ok, feil } from '@navikt/familie-skjema';
import { RessursStatus, byggHenterRessurs } from '@navikt/familie-typer';
import type { Ressurs } from '@navikt/familie-typer';

import { useBehandlingApi } from '../../../api/behandling';
import { IBrevmottaker, MottakerType } from '../../../typer/Brevmottaker';
import { useBrevmottaker } from '../Verge/VergeContext';

export interface ILeggTilFjernBrevmottakerSkjema {
    mottaker: MottakerType | '';
    navn: string;
    adresselinje1: string;
    adresselinje2: string;
    postnummer: string;
    poststed: string;
    land: string;
}

const useLeggTilFjernBrevmottaker = (behandlingId: string) => {
    const { fjernBrevmottaker, leggTilEllerOppdaterBrevmottaker } = useBrevmottaker();
    const { fjernManuellBrevmottaker } = useBehandlingApi();

    const mottaker = useFelt<MottakerType | ''>({
        verdi: '',
        valideringsfunksjon: felt =>
            felt.verdi !== '' ? ok(felt) : feil(felt, 'Feltet er påkrevd'),
    });
    const navn = useFelt<string>({
        verdi: '',
        valideringsfunksjon: felt => {
            if (felt.verdi === '') {
                return feil(felt, 'Navn på person eller organisasjon er påkrevd');
            }
            return felt.verdi.length <= 80
                ? ok(felt)
                : feil(felt, 'Feltet kan ikke inneholde mer enn 80 tegn');
        },
    });
    const adresselinje1 = useFelt<string>({
        verdi: '',
        valideringsfunksjon: felt => {
            if (felt.verdi === '') {
                return feil(felt, 'Feltet er påkrevd');
            }
            return felt.verdi.length <= 80
                ? ok(felt)
                : feil(felt, 'Feltet kan ikke inneholde mer enn 80 tegn');
        },
    });
    const adresselinje2 = useFelt<string>({
        verdi: '',
        valideringsfunksjon: felt =>
            felt.verdi.length <= 80
                ? ok(felt)
                : feil(felt, 'Feltet kan ikke inneholde mer enn 80 tegn'),
    });
    const postnummer = useFelt<string>({
        verdi: '',
        valideringsfunksjon: felt => {
            if (felt.verdi === '') {
                return feil(felt, 'Feltet er påkrevd');
            }
            return felt.verdi.length <= 10
                ? ok(felt)
                : feil(felt, 'Feltet kan ikke inneholde mer enn 10 tegn');
        },
    });
    const poststed = useFelt<string>({
        verdi: '',
        valideringsfunksjon: felt => {
            if (felt.verdi === '') {
                return feil(felt, 'Feltet er påkrevd');
            }
            return felt.verdi.length <= 50
                ? ok(felt)
                : feil(felt, 'Feltet kan ikke inneholde mer enn 50 tegn');
        },
    });
    const land = useFelt<string>({
        verdi: '',
        valideringsfunksjon: felt =>
            felt.verdi !== ''
                ? ok(felt)
                : feil(felt, 'Feltet er påkrevd. Velg Norge dersom brevet skal sendes innenlands.'),
    });

    const {
        skjema,
        kanSendeSkjema,
        settVisfeilmeldinger,
        onSubmit,
        nullstillSkjema,
        settSubmitRessurs,
        valideringErOk,
    } = useSkjema<ILeggTilFjernBrevmottakerSkjema, string>({
        felter: {
            mottaker,
            navn,
            adresselinje1,
            adresselinje2,
            postnummer,
            poststed,
            land,
        },
        skjemanavn: 'Legg til eller fjern brevmottaker',
    });

    const lagreBrevmottakerOgOppdaterState = (mottakerId?: string) => {
        if (kanSendeSkjema()) {
            settSubmitRessurs(byggHenterRessurs());
            settVisfeilmeldinger(false);
            const manuellBrevmottakerRequest: IBrevmottaker = {
                type: skjema.felter.mottaker.verdi as MottakerType,
                navn: skjema.felter.navn.verdi,
                manuellAdresseInfo: {
                    adresselinje1: skjema.felter.adresselinje1.verdi,
                    adresselinje2:
                        skjema.felter.adresselinje2.verdi !== ''
                            ? skjema.felter.adresselinje2.verdi
                            : undefined,
                    postnummer: skjema.felter.postnummer.verdi,
                    poststed: skjema.felter.poststed.verdi,
                    landkode: skjema.felter.land.verdi,
                },
            };
            onSubmit(
                {
                    method: mottakerId ? 'PUT' : 'POST',
                    data: manuellBrevmottakerRequest,
                    url: `/familie-tilbake/api/brevmottaker/manuell/${behandlingId}/${
                        mottakerId || ''
                    }`,
                },
                (response: Ressurs<string>) => {
                    if (response.status === RessursStatus.SUKSESS) {
                        const id = mottakerId || response.data;
                        leggTilEllerOppdaterBrevmottaker(id, manuellBrevmottakerRequest);
                        nullstillSkjema();
                    }
                }
            );
        } else {
            settVisfeilmeldinger(true);
        }
    };

    const fjernBrevMottakerOgOppdaterState = (mottakerId: string) => {
        fjernManuellBrevmottaker(behandlingId, mottakerId).then((respons: Ressurs<string>) => {
            if (respons.status === RessursStatus.SUKSESS) {
                fjernBrevmottaker(mottakerId);
            }
        });
    };

    return {
        skjema,
        valideringErOk,
        lagreBrevmottakerOgOppdaterState,
        fjernBrevMottakerOgOppdaterState,
    };
};

export default useLeggTilFjernBrevmottaker;
