import * as React from 'react';

import createUseContext from 'constate';
import { useNavigate } from 'react-router-dom';

import { feil, ok, useFelt, useSkjema } from '@navikt/familie-skjema';
import { byggHenterRessurs, type Ressurs, RessursStatus } from '@navikt/familie-typer';

import { useBehandlingApi } from '../../../api/behandling';
import { Vergetype } from '../../../kodeverk/verge';
import { IBehandling } from '../../../typer/behandling';
import { IBrevmottaker, MottakerType } from '../../../typer/Brevmottaker';
import { IFagsak } from '../../../typer/fagsak';
import { sider } from '../../Felleskomponenter/Venstremeny/sider';

interface ILeggTilEndreBrevmottakerSkjema {
    mottaker: MottakerType | '';
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

const skalEkskludereDefaultMottaker = (brevmottakere: IBrevmottaker[]) => {
    return brevmottakere.some(
        brevmottaker =>
            brevmottaker.type === MottakerType.BRUKER_MED_UTENLANDSK_ADRESSE ||
            brevmottaker.type === MottakerType.DØDSBO
    );
};

const [BrevmottakerProvider, useBrevmottaker] = createUseContext(
    ({ behandling, fagsak }: IProps) => {
        const bruker: IBrevmottaker = {
            type: MottakerType.BRUKER,
            navn: fagsak.bruker.navn,
            personIdent: fagsak.bruker.personIdent,
        };
        const defaultMottaker = 'bruker';
        const [brevmottakere, settBrevMottakere] = React.useState({ [defaultMottaker]: bruker } as {
            [id: string]: IBrevmottaker;
        });

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
                navn: useFelt<string>({
                    verdi: '',
                    valideringsfunksjon: felt => {
                        if (felt.verdi === '') {
                            return feil(felt, 'Navn på person eller organisasjon er påkrevd');
                        }
                        return felt.verdi.length <= 80
                            ? ok(felt)
                            : feil(felt, 'Feltet kan ikke inneholde mer enn 80 tegn');
                    },
                }),
                adresselinje1: useFelt<string>({
                    verdi: '',
                    valideringsfunksjon: felt => {
                        if (felt.verdi === '') {
                            return feil(felt, 'Feltet er påkrevd');
                        }
                        return felt.verdi.length <= 80
                            ? ok(felt)
                            : feil(felt, 'Feltet kan ikke inneholde mer enn 80 tegn');
                    },
                }),
                adresselinje2: useFelt<string>({
                    verdi: '',
                    valideringsfunksjon: felt =>
                        felt.verdi.length <= 80
                            ? ok(felt)
                            : feil(felt, 'Feltet kan ikke inneholde mer enn 80 tegn'),
                }),
                postnummer: useFelt<string>({
                    verdi: '',
                    valideringsfunksjon: felt => {
                        if (felt.verdi === '') {
                            return feil(felt, 'Feltet er påkrevd');
                        }
                        return felt.verdi.length <= 10
                            ? ok(felt)
                            : feil(felt, 'Feltet kan ikke inneholde mer enn 10 tegn');
                    },
                }),
                poststed: useFelt<string>({
                    verdi: '',
                    valideringsfunksjon: felt => {
                        if (felt.verdi === '') {
                            return feil(felt, 'Feltet er påkrevd');
                        }
                        return felt.verdi.length <= 50
                            ? ok(felt)
                            : feil(felt, 'Feltet kan ikke inneholde mer enn 50 tegn');
                    },
                }),
                land: useFelt<string>({
                    verdi: '',
                    valideringsfunksjon: felt =>
                        felt.verdi !== ''
                            ? ok(felt)
                            : feil(
                                  felt,
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
                const type = skjema.felter.mottaker.verdi as MottakerType;
                const manuellBrevmottakerRequest: IBrevmottaker = {
                    type: type,
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
                if (type === MottakerType.VERGE || type === MottakerType.FULLMEKTIG) {
                    manuellBrevmottakerRequest.vergetype = Vergetype.UDEFINERT;
                }

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
                            const id = mottakerId || response.data;
                            leggTilEllerOppdaterBrevmottaker(id, manuellBrevmottakerRequest);
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
        };
    }
);

export { BrevmottakerProvider, useBrevmottaker };
