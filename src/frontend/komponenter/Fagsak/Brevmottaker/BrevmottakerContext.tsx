import * as React from 'react';

import { AxiosError } from 'axios';
import createUseContext from 'constate';
import { useNavigate } from 'react-router-dom';

import {
    type Avhengigheter,
    type FeltState,
    ok,
    useFelt,
    useSkjema,
    Valideringsstatus,
} from '@navikt/familie-skjema';
import { byggFeiletRessurs, type Ressurs, RessursStatus } from '@navikt/familie-typer';

import { useBehandlingApi } from '../../../api/behandling';
import { useBehandling } from '../../../context/BehandlingContext';
import { Vergetype } from '../../../kodeverk/verge';
import { VergeDto, VergeStegPayload } from '../../../typer/api';
import { Behandlingssteg, IBehandling } from '../../../typer/behandling';
import { IBrevmottaker, MottakerType } from '../../../typer/Brevmottaker';
import { IFagsak } from '../../../typer/fagsak';
import {
    erFeltetEmpty,
    validerFødselsnummerFelt,
    validerTekstFelt,
    validerTekstFeltMaksLengde,
} from '../../../utils';
import { sider } from '../../Felleskomponenter/Venstremeny/sider';

const erVergetypeOppfylt = (avhengigheter?: Avhengigheter) =>
    avhengigheter?.vergetype.valideringsstatus === Valideringsstatus.OK;

const erAdvokatValgt = (avhengigheter?: Avhengigheter) =>
    erVergetypeOppfylt(avhengigheter) && avhengigheter?.vergetype.verdi === Vergetype.ADVOKAT;

interface IProps {
    behandling: IBehandling;
    fagsak: IFagsak;
}

const [BrevmottakerProvider, useBrevmottaker] = createUseContext(
    ({ behandling, fagsak }: IProps) => {
        const [stegErBehandlet, settStegErBehandlet] = React.useState<boolean>(false);
        const [erAutoutført, settErAutoutført] = React.useState<boolean>();
        const [verge, settVerge] = React.useState<VergeDto>();
        const [henterData, settHenterData] = React.useState<boolean>(false);
        const [senderInn, settSenderInn] = React.useState<boolean>(false);
        const [vergeRespons, settVergeRepons] = React.useState<Ressurs<string>>();
        const { gjerVergeKall, sendInnVerge, hentManuelleBrevmottakere } = useBehandlingApi();
        const { erStegBehandlet, erStegAutoutført, hentBehandlingMedBehandlingId } =
            useBehandling();
        const navigate = useNavigate();

        const bruker: { [id: string]: IBrevmottaker } = {
            ['bruker']: {
                type: MottakerType.BRUKER,
                navn: fagsak.bruker.navn,
                personIdent: fagsak.bruker.personIdent,
            },
        };
        const [brevmottakere, settBrevMottakere] = React.useState(bruker);

        React.useEffect(() => {
            if (behandling.harManuelleBrevmottakere) {
                hentBrevmottakere();
            } else if (behandling.harVerge) {
                settStegErBehandlet(erStegBehandlet(Behandlingssteg.VERGE));
                settErAutoutført(erStegAutoutført(Behandlingssteg.VERGE));
                settHenterData(true);
                hentVerge();
            }
        }, [behandling]);

        React.useEffect(() => {
            if (skalEkskludereDefaultMottaker()) {
                fjernBrevmottaker('bruker');
            } else if (!Object.keys(brevmottakere).includes('bruker')) {
                settBrevMottakere({ ...bruker, ...brevmottakere });
            }
        }, [brevmottakere]);

        const skalEkskludereDefaultMottaker = () => {
            return Object.values(brevmottakere).some(
                brevmottaker =>
                    brevmottaker.type === MottakerType.BRUKER_MED_UTENLANDSK_ADRESSE ||
                    brevmottaker.type === MottakerType.DØDSBO
            );
        };

        const leggTilEllerOppdaterBrevmottaker = (id: string, brevmottaker: IBrevmottaker) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [id]: _gammelVersjon, ...andreMottakere } = brevmottakere;
            settBrevMottakere({ [id]: brevmottaker, ...andreMottakere });
        };

        const fjernBrevmottaker = (id: string) => {
            const { [id]: fjernet, ...gjenværende } = brevmottakere;
            if (fjernet !== undefined) {
                settBrevMottakere(gjenværende);
            }
        };

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

        const hentVerge = () => {
            gjerVergeKall(behandling.behandlingId).then((respons: Ressurs<VergeDto>) => {
                if (respons.status === RessursStatus.SUKSESS) {
                    settHenterData(false);
                    const hentetVerge = respons.data;
                    skjema.felter.vergetype.onChange(hentetVerge.type);
                    skjema.felter.begrunnelse.onChange(hentetVerge.begrunnelse);
                    skjema.felter.navn.onChange(hentetVerge.navn);
                    skjema.felter.fødselsnummer.onChange(
                        hentetVerge.ident ? hentetVerge.ident : ''
                    );
                    skjema.felter.organisasjonsnummer.onChange(
                        hentetVerge.orgNr ? hentetVerge.orgNr : ''
                    );
                    settVerge(hentetVerge);
                }
            });
        };

        const vergetype = useFelt<Vergetype | ''>({
            feltId: 'vergetype',
            verdi: '',
            valideringsfunksjon: (felt: FeltState<Vergetype | ''>) => {
                return erFeltetEmpty(felt);
            },
        });

        const { skjema, kanSendeSkjema } = useSkjema<
            {
                begrunnelse: string | '';
                vergetype: Vergetype | '';
                navn: string | '';
                organisasjonsnummer: string | '';
                fødselsnummer: string | '';
            },
            string
        >({
            felter: {
                begrunnelse: useFelt<string | ''>({
                    feltId: 'begrunnelse',
                    verdi: '',
                    valideringsfunksjon: (felt: FeltState<string | ''>) => {
                        return validerTekstFeltMaksLengde(400, felt);
                    },
                }),
                vergetype,
                navn: useFelt<string | ''>({
                    feltId: 'navn',
                    verdi: '',
                    avhengigheter: { vergetype },
                    valideringsfunksjon: (
                        felt: FeltState<string | ''>,
                        avhengigheter?: Avhengigheter
                    ) => {
                        if (!erVergetypeOppfylt(avhengigheter)) return ok(felt);
                        const gyldig = validerTekstFelt(felt);
                        return gyldig;
                    },
                }),
                organisasjonsnummer: useFelt<string | ''>({
                    feltId: 'organisasjonsnummer',
                    verdi: '',
                    avhengigheter: { vergetype },
                    valideringsfunksjon: (
                        felt: FeltState<string | ''>,
                        avhengigheter?: Avhengigheter
                    ) => {
                        if (!erAdvokatValgt(avhengigheter)) return ok(felt);
                        return validerTekstFelt(felt);
                    },
                }),
                fødselsnummer: useFelt<string | ''>({
                    feltId: 'fødselsnummer',
                    verdi: '',
                    avhengigheter: { vergetype },
                    valideringsfunksjon: (
                        felt: FeltState<string | ''>,
                        avhengigheter?: Avhengigheter
                    ) => {
                        if (!erVergetypeOppfylt(avhengigheter) || erAdvokatValgt(avhengigheter))
                            return ok(felt);
                        return validerFødselsnummerFelt(felt);
                    },
                }),
            },
            skjemanavn: 'vergeskjema',
        });

        const harEndretOpplysninger = () => {
            if (verge) {
                const erAdvokat = verge.type === Vergetype.ADVOKAT;
                return (
                    skjema.felter.vergetype.verdi !== verge.type ||
                    skjema.felter.navn.verdi !== verge.navn ||
                    skjema.felter.begrunnelse.verdi !== verge.begrunnelse ||
                    (!erAdvokat && skjema.felter.fødselsnummer.verdi !== verge.ident) ||
                    (erAdvokat && skjema.felter.organisasjonsnummer.verdi !== verge.orgNr)
                );
            }
            return false;
        };

        const sendInn = () => {
            if (stegErBehandlet && !harEndretOpplysninger()) {
                navigate(
                    `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}/${sider.FAKTA.href}`
                );
            } else if (kanSendeSkjema()) {
                settSenderInn(true);
                // @ts-ignore
                const vergetype: Vergetype = skjema.felter.vergetype.verdi;
                const payload: VergeStegPayload = {
                    '@type': 'VERGE',
                    verge: {
                        type: vergetype,
                        begrunnelse: skjema.felter.begrunnelse.verdi,
                        navn: skjema.felter.navn.verdi,
                        ident:
                            vergetype !== Vergetype.ADVOKAT
                                ? skjema.felter.fødselsnummer.verdi
                                : undefined,
                        orgNr:
                            vergetype === Vergetype.ADVOKAT
                                ? skjema.felter.organisasjonsnummer.verdi
                                : undefined,
                    },
                };
                sendInnVerge(behandling.behandlingId, payload)
                    .then((respons: Ressurs<string>) => {
                        settSenderInn(false);
                        if (respons.status === RessursStatus.SUKSESS) {
                            hentBehandlingMedBehandlingId(behandling.behandlingId, true);
                        } else {
                            settVergeRepons(respons);
                        }
                    })
                    .catch((error: AxiosError) => {
                        console.log('Error ved sending av verge: ', error);
                        settSenderInn(false);
                        settVergeRepons(byggFeiletRessurs('Ukjent feil ved sending av verge'));
                    });
            }
        };

        const gåTilNeste = () => {
            navigate(
                `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}/${sider.FAKTA.href}`
            );
        };

        return {
            behandling,
            stegErBehandlet,
            erAutoutført,
            henterData,
            skjema,
            senderInn,
            sendInn,
            vergeRespons,
            brevmottakere,
            fjernBrevmottaker,
            leggTilEllerOppdaterBrevmottaker,
            gåTilNeste,
        };
    }
);

export { BrevmottakerProvider, useBrevmottaker };
