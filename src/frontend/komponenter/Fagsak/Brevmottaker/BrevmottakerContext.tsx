import type { Avhengigheter } from '../../../hooks/skjema';
import type { IBehandling } from '../../../typer/behandling';
import type { IBrevmottaker } from '../../../typer/Brevmottaker';
import type { IFagsak } from '../../../typer/fagsak';

import createUseContext from 'constate';
import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { useBehandlingApi } from '../../../api/behandling';
import { useBehandling } from '../../../context/BehandlingContext';
import { feil, type FeltState, type ISkjema, ok, useFelt, useSkjema } from '../../../hooks/skjema';
import { Vergetype } from '../../../kodeverk/verge';
import { AdresseKilde, MottakerType, mottakerTypeVisningsnavn } from '../../../typer/Brevmottaker';
import { byggHenterRessurs, type Ressurs, RessursStatus } from '../../../typer/ressurs';
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
        adresseKilde === AdresseKilde.ManuellRegistrering ||
        adresseKilde === AdresseKilde.Udefinert
    ) {
        return (
            feilNårFeltetErTomt(felt, feilmelding) ||
            feilNårFeltetOverskriderMakslengde(felt, maksLengde)
        );
    }
    return ok(felt);
};

const validerValgtMottakerType = (
    felt: FeltState<MottakerType | ''>,
    behandling: IBehandling,
    idTilMottakerUnderEndring: string | undefined
) => {
    const eksisterendeMottaker = behandling.manuelleBrevmottakere.find(
        mottaker => mottaker.id !== idTilMottakerUnderEndring
    )?.brevmottaker;

    if (felt.verdi === '') {
        return feil(felt, 'Feltet er påkrevd');
    }
    if (eksisterendeMottaker !== undefined) {
        const eksisterendeBrevmottakerType = eksisterendeMottaker.type;
        if (felt.verdi === eksisterendeBrevmottakerType) {
            return feil(felt, `${mottakerTypeVisningsnavn[felt.verdi]} er allerede lagt til`);
        }
        if (
            felt.verdi === MottakerType.Dødsbo ||
            eksisterendeBrevmottakerType === MottakerType.Dødsbo
        ) {
            return feil(felt, 'Dødsbo kan ikke kombineres med andre brevmottakere');
        }
        if (
            felt.verdi === MottakerType.BrukerMedUtenlandskAdresse ||
            eksisterendeBrevmottakerType === MottakerType.BrukerMedUtenlandskAdresse
        ) {
            return ok(felt);
        }
        return feil(
            felt,
            `${
                mottakerTypeVisningsnavn[eksisterendeBrevmottakerType]
            } kan ikke kombineres med ${mottakerTypeVisningsnavn[felt.verdi].toLowerCase()}.`
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
        ...(adresseKilde === AdresseKilde.OppslagRegister
            ? {
                  personIdent: skjema.felter.fødselsnummer.verdi,
              }
            : adresseKilde === AdresseKilde.OppslagOrganisasjonsregister
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
        ...((type === MottakerType.Verge || type === MottakerType.Fullmektig) && {
            vergetype: Vergetype.Udefinert,
        }),
    };
};

const populerSkjema = (
    skjema: ISkjema<ILeggTilEndreBrevmottakerSkjema, string>,
    brevmottaker: IBrevmottaker
) => {
    const [, eventuellKontaktperson] = brevmottaker.navn.split(' v/ ');
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
            brevmottaker.type === MottakerType.BrukerMedUtenlandskAdresse ||
            brevmottaker.type === MottakerType.Dødsbo
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
            type: MottakerType.Bruker,
            navn: fagsak.bruker.navn,
            personIdent: fagsak.bruker.personIdent,
        };
        const defaultMottaker = 'bruker';
        const [brevmottakere, settBrevMottakere] = useState({ [defaultMottaker]: bruker } as {
            [id: string]: IBrevmottaker;
        });
        const [adresseKilde, settAdresseKilde] = useState<AdresseKilde>(AdresseKilde.Udefinert);
        const [brevmottakerIdTilEndring, settBrevmottakerIdTilEndring] = useState<
            string | undefined
        >();

        const { hentBehandlingMedBehandlingId } = useBehandling();
        const { fjernManuellBrevmottaker } = useBehandlingApi();
        const navigate = useNavigate();

        React.useEffect(() => {
            const manuelleBrevmottakere: { [id: string]: IBrevmottaker } = {};
            behandling.manuelleBrevmottakere.forEach(value => {
                manuelleBrevmottakere[value.id] = value.brevmottaker;
            });
            settBrevMottakere(manuelleBrevmottakere);
        }, [behandling]);

        React.useEffect(() => {
            if (skalEkskludereDefaultMottaker(Object.values(brevmottakere))) {
                fjernBrevmottaker(defaultMottaker);
            } else if (!Object.keys(brevmottakere).includes(defaultMottaker)) {
                leggTilEllerOppdaterBrevmottaker(defaultMottaker, bruker);
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [brevmottakere]);

        React.useEffect(() => {
            if (brevmottakerIdTilEndring) {
                const lagretBrevmottaker = brevmottakere[brevmottakerIdTilEndring];
                const erBruker = brevmottakerIdTilEndring === 'bruker';
                if (erBruker) {
                    skjema.felter.mottaker.validerOgSettFelt(
                        MottakerType.BrukerMedUtenlandskAdresse
                    );
                    settAdresseKilde(AdresseKilde.ManuellRegistrering);
                } else {
                    populerSkjema(skjema, lagretBrevmottaker);
                    settAdresseKilde(
                        lagretBrevmottaker.personIdent
                            ? AdresseKilde.OppslagRegister
                            : lagretBrevmottaker.organisasjonsnummer
                              ? AdresseKilde.OppslagOrganisasjonsregister
                              : AdresseKilde.ManuellRegistrering
                    );
                }
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [brevmottakerIdTilEndring]);

        const leggTilEllerOppdaterBrevmottaker = (id: string, brevmottaker: IBrevmottaker) => {
            settBrevMottakere({ ...brevmottakere, [id]: brevmottaker });
        };

        const fjernBrevmottaker = (id: string) => {
            const { [id]: fjernet, ...gjenværende } = brevmottakere;
            if (fjernet !== undefined) {
                settBrevMottakere(gjenværende);
            }
        };

        const feilNårUtenlandskAdresseHarNorgeSomLand = (
            mottaker: MottakerType,
            felt: FeltState<string>
        ) => {
            const norgeErUlovligValgt =
                mottaker === MottakerType.BrukerMedUtenlandskAdresse && felt.verdi === 'NO';

            if (norgeErUlovligValgt) {
                return feil(felt, 'Norge kan ikke være satt for bruker med utenlandsk adresse');
            }
        };

        const mottaker = useFelt<MottakerType | ''>({
            verdi: '',
            avhengigheter: { behandling, brevmottakerIdTilEndring },
            valideringsfunksjon: (felt, avhenigheter) =>
                validerValgtMottakerType(
                    felt,
                    avhenigheter?.behandling,
                    avhenigheter?.brevmottakerIdTilEndring
                ),
        });

        const land = useFelt<string>({
            verdi: '',
            avhengigheter: { adresseKilde, mottaker },
            valideringsfunksjon: (felt, avhengigheter) => {
                return (
                    feilNårUtenlandskAdresseHarNorgeSomLand(avhengigheter?.mottaker.verdi, felt) ||
                    validerPåkrevdFeltForManuellRegistrering(felt, avhengigheter?.adresseKilde, 2)
                );
            },
        });

        const postnummer = useFelt<string>({
            verdi: '',
            avhengigheter: { adresseKilde, land },
            valideringsfunksjon: (felt, avhengigheter) => {
                if (avhengigheter?.land.verdi !== 'NO' && felt.verdi === '') {
                    return ok(felt);
                } else {
                    return validerPåkrevdFeltForManuellRegistrering(
                        felt,
                        avhengigheter?.adresseKilde,
                        10
                    );
                }
            },
            skalFeltetVises: (avhengigheter: Avhengigheter) => {
                return avhengigheter?.land.verdi === 'NO';
            },
        });

        const poststed = useFelt<string>({
            verdi: '',
            avhengigheter: { adresseKilde, land },
            valideringsfunksjon: (felt, avhengigheter) => {
                if (avhengigheter?.land.verdi !== 'NO' && felt.verdi === '') {
                    return ok(felt);
                } else {
                    return validerPåkrevdFeltForManuellRegistrering(
                        felt,
                        avhengigheter?.adresseKilde,
                        50
                    );
                }
            },
            skalFeltetVises: (avhengigheter: Avhengigheter) => {
                return avhengigheter?.land.verdi === 'NO';
            },
        });

        const {
            skjema,
            kanSendeSkjema,
            settVisfeilmeldinger,
            onSubmit,
            nullstillSkjema,
            settSubmitRessurs,
            valideringErOk,
            validerAlleSynligeFelter,
        } = useSkjema<ILeggTilEndreBrevmottakerSkjema, string>({
            felter: {
                mottaker,
                fødselsnummer: useFelt<string>({
                    verdi: '',
                    avhengigheter: { adresseKilde },
                    valideringsfunksjon: (felt, avhengigheter) => {
                        if (avhengigheter?.adresseKilde === AdresseKilde.OppslagRegister) {
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
                            AdresseKilde.OppslagOrganisasjonsregister
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
                land,
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
                postnummer,
                poststed,
            },
            skjemanavn: 'Legg til eller endre brevmottaker',
        });

        // Postnummer og poststed disables og skal sendes med som tom streng når landet ikke er Norge
        if (land.verdi !== 'NO' && postnummer.verdi !== '') {
            postnummer.nullstill();
        }

        if (land.verdi !== 'NO' && poststed.verdi !== '') {
            poststed.nullstill();
        }

        const lagreBrevmottakerOgOppdaterState = (mottakerId?: string, lukkModal?: () => void) => {
            if (kanSendeSkjema()) {
                settSubmitRessurs(byggHenterRessurs());
                settVisfeilmeldinger(false);
                const manuellBrevmottakerRequest: IBrevmottaker = opprettManuellBrevmottakerRequest(
                    skjema,
                    adresseKilde
                );
                const mottakerIdPostfix = `${
                    mottakerId && mottakerId !== 'bruker' ? `/${mottakerId}` : ''
                }`;

                onSubmit(
                    {
                        method: mottakerIdPostfix ? 'PUT' : 'POST',
                        data: manuellBrevmottakerRequest,
                        url: `/familie-tilbake/api/brevmottaker/manuell/${behandling.behandlingId}${mottakerIdPostfix}`,
                    },
                    (response: Ressurs<string>) => {
                        if (response.status === RessursStatus.Suksess) {
                            hentBehandlingMedBehandlingId(behandling.behandlingId);
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
                    if (respons.status === RessursStatus.Suksess) {
                        hentBehandlingMedBehandlingId(behandling.behandlingId);
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
            brevmottakerIdTilEndring,
            settBrevmottakerIdTilEndring,
            bruker,
            validerAlleSynligeFelter,
        };
    }
);

export { BrevmottakerProvider, useBrevmottaker };
