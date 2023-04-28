import * as React from 'react';
import { useState } from 'react';

import createUseContext from 'constate';
import { useNavigate } from 'react-router-dom';

import { feil, type FeltState, type ISkjema, ok, useFelt, useSkjema } from '@navikt/familie-skjema';
import { byggHenterRessurs, type Ressurs, RessursStatus } from '@navikt/familie-typer';

import { useBehandlingApi } from '../../../api/behandling';
import { Vergetype } from '../../../kodeverk/verge';
import { IBehandling } from '../../../typer/behandling';
import { AdresseKilde, IBrevmottaker, MottakerType } from '../../../typer/Brevmottaker';
import { IFagsak } from '../../../typer/fagsak';
import { isNumeric } from '../../../utils';
import { sider } from '../../Felleskomponenter/Venstremeny/sider';

const feilNårFeltetErTomt = (felt: FeltState<string>, feilmelding?: string) => {
    return felt.verdi === '' ? feil(felt, feilmelding || 'Feltet er påkrevd') : undefined;
};
const feilNårFeltetOverskriderMakslengde = (felt: FeltState<string>, maksLengde: number) => {
    return felt.verdi.length > maksLengde
        ? feil(felt, `Feltet kan ikke inneholde mer enn ${maksLengde} tegn`)
        : ok(felt);
};

const feilNårOrgnummerErUgyldig = (orgnrFelt: FeltState<string>) => {
    return orgnrFelt.verdi.length !== 9 || !isNumeric(orgnrFelt.verdi)
        ? feil(orgnrFelt, `Organisasjonsnummer må være 9 sammenhengende siffer`)
        : ok(orgnrFelt);
};

const feilNårFødselsnummerErUgyldig = (fnrFelt: FeltState<string>) => {
    return fnrFelt.verdi.length !== 11 || !isNumeric(fnrFelt.verdi)
        ? feil(fnrFelt, `Fødselsnummer må være 11 sammenhengende siffer`)
        : ok(fnrFelt);
};

const validerPåkrevdFeltForManuellRegistrering = (
    felt: FeltState<string>,
    adresseKilde: AdresseKilde,
    maksLengde: number,
    feilmelding?: string
) => {
    if (
        adresseKilde === AdresseKilde.MANUELL_REGISTRERING ||
        adresseKilde === AdresseKilde.UDEFINERT
    ) {
        return (
            feilNårFeltetErTomt(felt, feilmelding) ||
            feilNårFeltetOverskriderMakslengde(felt, maksLengde)
        );
    }
    return ok(felt);
};

const opprettManuellBrevmottakerRequest = (
    skjema: ISkjema<ILeggTilEndreBrevmottakerSkjema, string>,
    adresseKilde: AdresseKilde
) => {
    const type = skjema.felter.mottaker.verdi as MottakerType;

    return {
        type: type,
        navn: skjema.felter.navn.verdi || ' ', // blank input erstattes med navn hentet fra register
        ...(adresseKilde === AdresseKilde.OPPSLAG_REGISTER
            ? {
                  personIdent: skjema.felter.fødselsnummer.verdi,
              }
            : adresseKilde === AdresseKilde.OPPSLAG_ORGANISASJONSREGISTER
            ? {
                  organisasjonsnummer: skjema.felter.organisasjonsnummer.verdi,
              }
            : {
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
              }),
        ...((type === MottakerType.VERGE || type === MottakerType.FULLMEKTIG) && {
            vergetype: Vergetype.UDEFINERT,
        }),
    };
};

const populerSkjema = (
    skjema: ISkjema<ILeggTilEndreBrevmottakerSkjema, string>,
    brevmottaker: IBrevmottaker
) => {
    const eventuellKontaktperson = brevmottaker.navn.split(' v/ ')[1];
    const manuellAdresseInfo = brevmottaker.manuellAdresseInfo;
    skjema.felter.mottaker.validerOgSettFelt(brevmottaker.type);
    skjema.felter.navn.validerOgSettFelt(
        brevmottaker.organisasjonsnummer ? eventuellKontaktperson : brevmottaker.navn
    );
    skjema.felter.fødselsnummer.validerOgSettFelt(brevmottaker.personIdent || '');
    skjema.felter.organisasjonsnummer.validerOgSettFelt(brevmottaker.organisasjonsnummer || '');
    if (manuellAdresseInfo) {
        skjema.felter.adresselinje1.validerOgSettFelt(manuellAdresseInfo.adresselinje1);
        skjema.felter.adresselinje2.validerOgSettFelt(manuellAdresseInfo.adresselinje2 || '');
        skjema.felter.postnummer.validerOgSettFelt(manuellAdresseInfo.postnummer);
        skjema.felter.poststed.validerOgSettFelt(manuellAdresseInfo.poststed);
        skjema.felter.land.validerOgSettFelt(manuellAdresseInfo.landkode);
    }
};

const skalEkskludereDefaultMottaker = (brevmottakere: IBrevmottaker[]) => {
    return brevmottakere.some(
        brevmottaker =>
            brevmottaker.type === MottakerType.BRUKER_MED_UTENLANDSK_ADRESSE ||
            brevmottaker.type === MottakerType.DØDSBO
    );
};
interface ILeggTilEndreBrevmottakerSkjema {
    mottaker: MottakerType | '';
    fødselsnummer: string;
    organisasjonsnummer: string;
    navn: string;
    adresselinje1: string;
    adresselinje2: string;
    postnummer: string;
    poststed: string;
    land: string;
}
interface IProps {
    behandling: IBehandling;
    fagsak: IFagsak;
}

const [BrevmottakerProvider, useBrevmottaker] = createUseContext(
    ({ behandling, fagsak }: IProps) => {
        const bruker: IBrevmottaker = {
            type: MottakerType.BRUKER,
            navn: fagsak.bruker.navn,
            personIdent: fagsak.bruker.personIdent,
        };
        const defaultMottaker = 'bruker';
        const [brevmottakere, settBrevMottakere] = useState({ [defaultMottaker]: bruker } as {
            [id: string]: IBrevmottaker;
        });
        const [adresseKilde, settAdresseKilde] = useState<AdresseKilde>(AdresseKilde.UDEFINERT);
        const [brevmottakerTilEndring, settBrevmottakerTilEndring] = useState<string | undefined>();

        const { fjernManuellBrevmottaker, hentManuelleBrevmottakere } = useBehandlingApi();
        const navigate = useNavigate();

        React.useEffect(() => {
            if (behandling.harManuelleBrevmottakere) {
                hentBrevmottakere();
            }
        }, [behandling]);

        React.useEffect(() => {
            if (skalEkskludereDefaultMottaker(Object.values(brevmottakere))) {
                fjernBrevmottaker(defaultMottaker);
            } else if (!Object.keys(brevmottakere).includes(defaultMottaker)) {
                leggTilEllerOppdaterBrevmottaker(defaultMottaker, bruker);
            }
        }, [brevmottakere]);

        React.useEffect(() => {
            if (brevmottakerTilEndring) {
                const opprinneligInput = brevmottakere[brevmottakerTilEndring];
                populerSkjema(skjema, opprinneligInput);
                settAdresseKilde(
                    opprinneligInput.personIdent
                        ? AdresseKilde.OPPSLAG_REGISTER
                        : opprinneligInput.organisasjonsnummer
                        ? AdresseKilde.OPPSLAG_ORGANISASJONSREGISTER
                        : AdresseKilde.MANUELL_REGISTRERING
                );
            }
        }, [brevmottakerTilEndring]);

        const hentBrevmottakere = () => {
            hentManuelleBrevmottakere(behandling.behandlingId).then(respons => {
                if (respons.status === RessursStatus.SUKSESS) {
                    const manuelleBrevmottakere: { [id: string]: IBrevmottaker } = {};
                    respons.data.forEach(responsDto => {
                        manuelleBrevmottakere[responsDto.id] = responsDto.brevmottaker;
                    });
                    settBrevMottakere(manuelleBrevmottakere);
                }
            });
        };

        const leggTilEllerOppdaterBrevmottaker = (id: string, brevmottaker: IBrevmottaker) => {
            settBrevMottakere({ ...brevmottakere, [id]: brevmottaker });
        };

        const fjernBrevmottaker = (id: string) => {
            const { [id]: fjernet, ...gjenværende } = brevmottakere;
            if (fjernet !== undefined) {
                settBrevMottakere(gjenværende);
            }
        };

        const {
            skjema,
            kanSendeSkjema,
            settVisfeilmeldinger,
            onSubmit,
            nullstillSkjema,
            settSubmitRessurs,
            valideringErOk,
        } = useSkjema<ILeggTilEndreBrevmottakerSkjema, string>({
            felter: {
                mottaker: useFelt<MottakerType | ''>({
                    verdi: '',
                    valideringsfunksjon: felt =>
                        felt.verdi !== '' ? ok(felt) : feil(felt, 'Feltet er påkrevd'),
                }),
                fødselsnummer: useFelt<string>({
                    verdi: '',
                    avhengigheter: { adresseKilde },
                    valideringsfunksjon: (felt, avhengigheter) => {
                        if (avhengigheter?.adresseKilde === AdresseKilde.OPPSLAG_REGISTER) {
                            return feilNårFeltetErTomt(felt) || feilNårFødselsnummerErUgyldig(felt);
                        }
                        return ok(felt);
                    },
                }),
                organisasjonsnummer: useFelt<string>({
                    verdi: '',
                    avhengigheter: { adresseKilde },
                    valideringsfunksjon: (felt, avhengigheter) => {
                        if (
                            avhengigheter?.adresseKilde ===
                            AdresseKilde.OPPSLAG_ORGANISASJONSREGISTER
                        ) {
                            return feilNårFeltetErTomt(felt) || feilNårOrgnummerErUgyldig(felt);
                        }
                        return ok(felt);
                    },
                }),
                navn: useFelt<string>({
                    verdi: '',
                    avhengigheter: { adresseKilde },
                    valideringsfunksjon: (felt, avhengigheter) =>
                        validerPåkrevdFeltForManuellRegistrering(
                            felt,
                            avhengigheter?.adresseKilde,
                            80,
                            'Navn på person eller organisasjon er påkrevd'
                        ),
                }),
                adresselinje1: useFelt<string>({
                    verdi: '',
                    avhengigheter: { adresseKilde },
                    valideringsfunksjon: (felt, avhengigheter) =>
                        validerPåkrevdFeltForManuellRegistrering(
                            felt,
                            avhengigheter?.adresseKilde,
                            80
                        ),
                }),
                adresselinje2: useFelt<string>({
                    verdi: '',
                    valideringsfunksjon: felt => feilNårFeltetOverskriderMakslengde(felt, 80),
                }),
                postnummer: useFelt<string>({
                    verdi: '',
                    avhengigheter: { adresseKilde },
                    valideringsfunksjon: (felt, avhengigheter) =>
                        validerPåkrevdFeltForManuellRegistrering(
                            felt,
                            avhengigheter?.adresseKilde,
                            10
                        ),
                }),
                poststed: useFelt<string>({
                    verdi: '',
                    avhengigheter: { adresseKilde },
                    valideringsfunksjon: (felt, avhengigheter) =>
                        validerPåkrevdFeltForManuellRegistrering(
                            felt,
                            avhengigheter?.adresseKilde,
                            50
                        ),
                }),
                land: useFelt<string>({
                    verdi: '',
                    avhengigheter: { adresseKilde },
                    valideringsfunksjon: (felt, avhengigheter) =>
                        validerPåkrevdFeltForManuellRegistrering(
                            felt,
                            avhengigheter?.adresseKilde,
                            2,
                            'Feltet er påkrevd. Velg Norge dersom brevet skal sendes innenlands.'
                        ),
                }),
            },
            skjemanavn: 'Legg til eller endre brevmottaker',
        });

        const lagreBrevmottakerOgOppdaterState = (mottakerId?: string, lukkModal?: () => void) => {
            if (kanSendeSkjema()) {
                settSubmitRessurs(byggHenterRessurs());
                settVisfeilmeldinger(false);
                const manuellBrevmottakerRequest: IBrevmottaker = opprettManuellBrevmottakerRequest(
                    skjema,
                    adresseKilde
                );

                onSubmit(
                    {
                        method: mottakerId ? 'PUT' : 'POST',
                        data: manuellBrevmottakerRequest,
                        url: `/familie-tilbake/api/brevmottaker/manuell/${
                            behandling.behandlingId
                        }/${mottakerId || ''}`,
                    },
                    (response: Ressurs<string>) => {
                        if (response.status === RessursStatus.SUKSESS) {
                            if (
                                adresseKilde === AdresseKilde.OPPSLAG_REGISTER ||
                                adresseKilde === AdresseKilde.OPPSLAG_ORGANISASJONSREGISTER
                            ) {
                                hentBrevmottakere();
                            } else {
                                const id = mottakerId || response.data;
                                leggTilEllerOppdaterBrevmottaker(id, manuellBrevmottakerRequest);
                            }

                            lukkModal ? lukkModal() : nullstillSkjema();
                        }
                    }
                );
            } else {
                settVisfeilmeldinger(true);
            }
        };

        const fjernBrevMottakerOgOppdaterState = (mottakerId: string) => {
            fjernManuellBrevmottaker(behandling.behandlingId, mottakerId).then(
                (respons: Ressurs<string>) => {
                    if (respons.status === RessursStatus.SUKSESS) {
                        fjernBrevmottaker(mottakerId);
                    }
                }
            );
        };

        const gåTilNeste = () => {
            navigate(
                `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}/${sider.FAKTA.href}`
            );
        };

        return {
            behandling,
            brevmottakere,
            skjema,
            nullstillSkjema,
            valideringErOk,
            lagreBrevmottakerOgOppdaterState,
            fjernBrevMottakerOgOppdaterState,
            gåTilNeste,
            adresseKilde,
            settAdresseKilde,
            settVisfeilmeldinger,
            brevmottakerTilEndring,
            settBrevmottakerTilEndring,
            bruker,
        };
    }
);

export { BrevmottakerProvider, useBrevmottaker };
