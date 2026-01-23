import type { VergeDto, VergeStegPayload } from '../../../typer/api';

import { useQueryClient } from '@tanstack/react-query';
import createUseContext from 'constate';
import * as React from 'react';
import { useNavigate } from 'react-router';

import { useBehandlingApi } from '../../../api/behandling';
import { useBehandling } from '../../../context/BehandlingContext';
import { useBehandlingState } from '../../../context/BehandlingStateContext';
import { useFagsak } from '../../../context/FagsakContext';
import { hentBehandlingQueryKey } from '../../../generated/@tanstack/react-query.gen';
import {
    type Avhengigheter,
    type FeltState,
    ok,
    useFelt,
    useSkjema,
    Valideringsstatus,
} from '../../../hooks/skjema';
import { useRedirectEtterLagring } from '../../../hooks/useRedirectEtterLagring';
import { Vergetype } from '../../../kodeverk/verge';
import { Behandlingssteg } from '../../../typer/behandling';
import { byggFeiletRessurs, type Ressurs, RessursStatus } from '../../../typer/ressurs';
import {
    erFeltetEmpty,
    validerFødselsnummerFelt,
    validerTekstFelt,
    validerTekstFeltMaksLengde,
} from '../../../utils';
import { SYNLIGE_STEG } from '../../../utils/sider';

const erVergetypeOppfylt = (avhengigheter?: Avhengigheter): boolean =>
    avhengigheter?.vergetype.valideringsstatus === Valideringsstatus.Ok;

const erAdvokatValgt = (avhengigheter?: Avhengigheter): boolean =>
    erVergetypeOppfylt(avhengigheter) && avhengigheter?.vergetype.verdi === Vergetype.Advokat;

const [VergeProvider, useVerge] = createUseContext(() => {
    const behandling = useBehandling();
    const { fagsystem, eksternFagsakId } = useFagsak();
    const queryClient = useQueryClient();
    const [stegErBehandlet, settStegErBehandlet] = React.useState<boolean>(false);
    const [erAutoutført, settErAutoutført] = React.useState<boolean>();
    const [verge, settVerge] = React.useState<VergeDto>();
    const [henterData, settHenterData] = React.useState<boolean>(false);
    const [senderInn, settSenderInn] = React.useState<boolean>(false);
    const [vergeRespons, settVergeRepons] = React.useState<Ressurs<string>>();
    const { gjerVergeKall, sendInnVerge } = useBehandlingApi();
    const { erStegBehandlet, erStegAutoutført, nullstillIkkePersisterteKomponenter } =
        useBehandlingState();
    const { utførRedirect } = useRedirectEtterLagring();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (behandling.harVerge) {
            settStegErBehandlet(erStegBehandlet(Behandlingssteg.Verge));
            settErAutoutført(erStegAutoutført(Behandlingssteg.Verge));
            settHenterData(true);
            hentVerge();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [behandling]);

    const hentVerge = (): void => {
        gjerVergeKall(behandling.behandlingId).then((respons: Ressurs<VergeDto>) => {
            if (respons.status === RessursStatus.Suksess) {
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

    const harEndretOpplysninger = (): boolean => {
        if (verge) {
            const erAdvokat = verge.type === Vergetype.Advokat;
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

    const sendInn = (): void => {
        if (stegErBehandlet && !harEndretOpplysninger()) {
            nullstillIkkePersisterteKomponenter();
            utførRedirect(
                `/fagsystem/${fagsystem}/fagsak/${eksternFagsakId}/behandling/${behandling.eksternBrukId}/${SYNLIGE_STEG.FAKTA.href}`
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
                        vergetype !== Vergetype.Advokat
                            ? skjema.felter.fødselsnummer.verdi
                            : undefined,
                    orgNr:
                        vergetype === Vergetype.Advokat
                            ? skjema.felter.organisasjonsnummer.verdi
                            : undefined,
                },
            };
            sendInnVerge(behandling.behandlingId, payload)
                .then((respons: Ressurs<string>) => {
                    settSenderInn(false);
                    if (respons.status === RessursStatus.Suksess) {
                        nullstillIkkePersisterteKomponenter();
                        queryClient.invalidateQueries({
                            queryKey: hentBehandlingQueryKey({
                                path: { behandlingId: behandling.behandlingId },
                            }),
                        });
                        navigate(
                            `/fagsystem/${fagsystem}/fagsak/${eksternFagsakId}/behandling/${behandling.eksternBrukId}`
                        );
                    } else {
                        settVergeRepons(respons);
                    }
                })
                .catch(() => {
                    settSenderInn(false);
                    settVergeRepons(byggFeiletRessurs('Ukjent feil ved sending av verge'));
                });
        }
    };

    return {
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
