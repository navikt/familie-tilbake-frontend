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
} from '../../../hooks/skjema';

import { useBehandlingApi } from '../../../api/behandling';
import { useBehandling } from '../../../context/BehandlingContext';
import { useRedirectEtterLagring } from '../../../hooks/useRedirectEtterLagring';
import { Vergetype } from '../../../kodeverk/verge';
import { VergeDto, VergeStegPayload } from '../../../typer/api';
import { Behandlingssteg, IBehandling } from '../../../typer/behandling';
import { IFagsak } from '../../../typer/fagsak';
import {
    erFeltetEmpty,
    validerFødselsnummerFelt,
    validerTekstFelt,
    validerTekstFeltMaksLengde,
} from '../../../utils';
import { sider } from '../../Felleskomponenter/Venstremeny/sider';
import { byggFeiletRessurs, type Ressurs, RessursStatus } from '../../../typer/ressurs';

const erVergetypeOppfylt = (avhengigheter?: Avhengigheter) =>
    avhengigheter?.vergetype.valideringsstatus === Valideringsstatus.OK;

const erAdvokatValgt = (avhengigheter?: Avhengigheter) =>
    erVergetypeOppfylt(avhengigheter) && avhengigheter?.vergetype.verdi === Vergetype.ADVOKAT;

interface IProps {
    behandling: IBehandling;
    fagsak: IFagsak;
}

const [VergeProvider, useVerge] = createUseContext(({ behandling, fagsak }: IProps) => {
    const [stegErBehandlet, settStegErBehandlet] = React.useState<boolean>(false);
    const [erAutoutført, settErAutoutført] = React.useState<boolean>();
    const [verge, settVerge] = React.useState<VergeDto>();
    const [henterData, settHenterData] = React.useState<boolean>(false);
    const [senderInn, settSenderInn] = React.useState<boolean>(false);
    const [vergeRespons, settVergeRepons] = React.useState<Ressurs<string>>();
    const { gjerVergeKall, sendInnVerge } = useBehandlingApi();
    const {
        erStegBehandlet,
        erStegAutoutført,
        hentBehandlingMedBehandlingId,
        nullstillIkkePersisterteKomponenter,
    } = useBehandling();
    const { utførRedirect } = useRedirectEtterLagring();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (behandling.harVerge) {
            settStegErBehandlet(erStegBehandlet(Behandlingssteg.VERGE));
            settErAutoutført(erStegAutoutført(Behandlingssteg.VERGE));
            settHenterData(true);
            hentVerge();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [behandling]);

    const hentVerge = () => {
        gjerVergeKall(behandling.behandlingId).then((respons: Ressurs<VergeDto>) => {
            if (respons.status === RessursStatus.SUKSESS) {
                settHenterData(false);
                const hentetVerge = respons.data;
                skjema.felter.vergetype.onChange(hentetVerge.type);
                skjema.felter.begrunnelse.onChange(hentetVerge.begrunnelse);
                skjema.felter.navn.onChange(hentetVerge.navn);
                skjema.felter.fødselsnummer.onChange(hentetVerge.ident ? hentetVerge.ident : '');
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
            nullstillIkkePersisterteKomponenter();
            utførRedirect(
                `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}/${sider.FAKTA.href}`
            );
        } else if (kanSendeSkjema()) {
            settSenderInn(true);
            // @ts-expect-error har verdi her
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
                        nullstillIkkePersisterteKomponenter();
                        hentBehandlingMedBehandlingId(behandling.behandlingId).then(() => {
                            navigate(
                                `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}`
                            );
                        });
                    } else {
                        settVergeRepons(respons);
                    }
                })
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                .catch((_error: AxiosError) => {
                    settSenderInn(false);
                    settVergeRepons(byggFeiletRessurs('Ukjent feil ved sending av verge'));
                });
        }
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
    };
});

export { VergeProvider, useVerge };
