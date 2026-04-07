import type { FC } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import type { ForhåndsvarselDto } from '~/generated';
import type {
    ForhåndsvarselFormData,
    UttalelseFormData,
} from '~/pages/fagsak/forhåndsvarsel/schema';

import { zodResolver } from '@hookform/resolvers/zod';
import { Radio, RadioGroup, VStack } from '@navikt/ds-react';
import { useEffect, useEffectEvent, useState } from 'react';
import { FormProvider, useForm, useFormContext, useFormState, useWatch } from 'react-hook-form';

import { useBehandlingState } from '~/context/BehandlingStateContext';
import { ActionBar } from '~/komponenter/action-bar/ActionBar';
import { FeilModal } from '~/komponenter/modal/feil/FeilModal';
import {
    getUttalelseValues,
    getUttalelseValuesBasertPåValg,
    HarUttaltSeg,
    SkalSendesForhåndsvarsel,
    uttalelseSchema,
} from '~/pages/fagsak/forhåndsvarsel/schema';
import {
    extractErrorFromMutationError,
    useForhåndsvarselMutations,
} from '~/pages/fagsak/forhåndsvarsel/useForhåndsvarselMutations';
import { useForhåndsvarselQueries } from '~/pages/fagsak/forhåndsvarsel/useForhåndsvarselQueries';
import { useVisGlobalAlert } from '~/stores/globalAlertStore';

import { OpprettForhåndsvarsel } from './OpprettForhåndsvarselSkjema';
import { UnntakMedUttalelse, type UnntakFormData } from './UnntakMedUttalelseSkjema';
import { UttalelseEtterVarsel } from './UttalelseEtterVarselSkjema';

type Props = {
    forhåndsvarselInfo: ForhåndsvarselDto | undefined;
    initialSkalSendesForhåndsvarsel: SkalSendesForhåndsvarsel | undefined;
};

export const ForhåndsvarselSkjema: FC<Props> = ({
    forhåndsvarselInfo,
    initialSkalSendesForhåndsvarsel,
}) => {
    const { actionBarStegtekst, nullstillIkkePersisterteKomponenter, behandlingILesemodus } =
        useBehandlingState();
    const visGlobalAlert = useVisGlobalAlert();
    const parentFormMethods = useFormContext<ForhåndsvarselFormData>();

    const [skalSendesForhåndsvarsel, setSkalSendesForhåndsvarsel] = useState<
        SkalSendesForhåndsvarsel | undefined
    >(initialSkalSendesForhåndsvarsel);
    const [radioError, setRadioError] = useState<string | null>(null);
    const [neiFlytIsDirty, setNeiFlytIsDirty] = useState(false);

    const {
        sendForhåndsvarselMutation,
        sendBrukeruttalelseMutation,
        sendUtsettUttalelseFristMutation,
        sendUtsettUttalelseFrist,
        sendBrukeruttalelse,
        sendForhåndsvarsel,
        sendUnntakMutation,
        sendUnntak,
        navigerTilNeste,
        navigerTilForrige,
    } = useForhåndsvarselMutations();

    const mutations = [
        { key: 'forhåndsvarsel', mutation: sendForhåndsvarselMutation },
        { key: 'brukeruttalelse', mutation: sendBrukeruttalelseMutation },
        { key: 'utsettFrist', mutation: sendUtsettUttalelseFristMutation },
        { key: 'unntak', mutation: sendUnntakMutation },
    ] as const;

    const { varselbrevtekster } = useForhåndsvarselQueries();

    const varselErSendt = !!forhåndsvarselInfo?.varselbrevDto?.varselbrevSendtTid;
    const fristErUtsatt = !!forhåndsvarselInfo?.utsettUttalelseFrist;

    const initialUttalelseValues = getUttalelseValues(forhåndsvarselInfo);

    const uttalelseMethods = useForm<UttalelseFormData>({
        resolver: zodResolver(uttalelseSchema),
        mode: 'onSubmit',
        reValidateMode: 'onChange',
        criteriaMode: 'all',
        defaultValues: initialUttalelseValues,
    });

    const harUttaltSeg = useWatch({
        control: uttalelseMethods.control,
        name: 'harUttaltSeg',
    });

    const utsettUttalelseFristVerdi = useWatch({
        control: uttalelseMethods.control,
        name: 'utsettUttalelseFrist',
    });

    const { dirtyFields: uttalelseDirtyFields } = useFormState({
        control: uttalelseMethods.control,
    });

    const getOppdatertUttalelseValues = useEffectEvent((harUttaltSeg: HarUttaltSeg) => {
        if (harUttaltSeg && harUttaltSeg === initialUttalelseValues.harUttaltSeg) {
            const nyeVerdier = getUttalelseValuesBasertPåValg(harUttaltSeg, forhåndsvarselInfo);
            const eksisterendeEtterUtsattFristVerdier = {
                harUttaltSegEtterUtsattFrist: uttalelseMethods.getValues(
                    'harUttaltSegEtterUtsattFrist'
                ),
                uttalelsesDetaljerEtterUtsattFrist: uttalelseMethods.getValues(
                    'uttalelsesDetaljerEtterUtsattFrist'
                ),
                kommentarEtterUtsattFrist: uttalelseMethods.getValues('kommentarEtterUtsattFrist'),
            };
            uttalelseMethods.reset({
                ...nyeVerdier,
                ...eksisterendeEtterUtsattFristVerdier,
            });
        }
    });

    useEffect(() => {
        getOppdatertUttalelseValues(harUttaltSeg);
    }, [harUttaltSeg]);

    useEffect(() => {
        if (sendForhåndsvarselMutation.isSuccess) {
            visGlobalAlert({
                title: 'Forhåndsvarsel er sendt',
                message:
                    'Du kan fortsette saksbehandlingen når bruker har uttalt seg, eller når fristen for å uttale seg (3 uker) har gått ut.',
                status: 'success',
            });
        }
    }, [sendForhåndsvarselMutation.isSuccess, visGlobalAlert]);

    const uttalelseIsDirty = Object.keys(uttalelseDirtyFields).length > 0;

    type SubmitAction = 'NAVIGER' | 'SEND_UTTALELSE' | 'UTSETT_FRIST';

    const getUttalelseSubmitAction = (): SubmitAction => {
        if (harUttaltSeg === HarUttaltSeg.UtsettFrist) {
            const eksisterendeFrist = forhåndsvarselInfo?.utsettUttalelseFrist;
            const utsettFristErEndret =
                utsettUttalelseFristVerdi?.nyFrist !== eksisterendeFrist?.nyFrist ||
                utsettUttalelseFristVerdi?.begrunnelse !== eksisterendeFrist?.begrunnelse;

            if (!eksisterendeFrist || utsettFristErEndret) {
                return 'UTSETT_FRIST';
            }
        }

        if (uttalelseIsDirty) {
            return 'SEND_UTTALELSE';
        }

        return 'NAVIGER';
    };

    const getNesteKnappTekst = (): string => {
        const erIkkeValgt =
            skalSendesForhåndsvarsel === undefined ||
            skalSendesForhåndsvarsel === SkalSendesForhåndsvarsel.IkkeValgt;

        if (erIkkeValgt) {
            return 'Neste';
        }

        if (skalSendesForhåndsvarsel === SkalSendesForhåndsvarsel.Ja) {
            if (!varselErSendt) {
                return 'Send forhåndsvarselet';
            }
            const action = getUttalelseSubmitAction();
            switch (action) {
                case 'UTSETT_FRIST':
                    return 'Utsett frist';
                case 'SEND_UTTALELSE':
                    return 'Lagre og gå til neste';
                default:
                    return 'Neste';
            }
        }

        const harEksisterendeUnntak = !!forhåndsvarselInfo?.forhåndsvarselUnntak;
        return !harEksisterendeUnntak || neiFlytIsDirty ? 'Lagre og gå til neste' : 'Neste';
    };

    const handleRadioChange = (
        value: SkalSendesForhåndsvarsel.Ja | SkalSendesForhåndsvarsel.Nei
    ): void => {
        setSkalSendesForhåndsvarsel(value);
        setRadioError(null);
        parentFormMethods.setValue('skalSendesForhåndsvarsel', value, { shouldDirty: true });
    };

    const handleUttalelseSubmit: SubmitHandler<UttalelseFormData> = (
        data: UttalelseFormData
    ): void => {
        const action = getUttalelseSubmitAction();
        if (action === 'NAVIGER') {
            navigerTilNeste();
            return;
        }
        if (harUttaltSeg === HarUttaltSeg.UtsettFrist) {
            sendUtsettUttalelseFrist(data);
            return;
        }
        sendBrukeruttalelse(data, varselErSendt);
        nullstillIkkePersisterteKomponenter();
    };

    const bekreftSendForhåndsvarsel = (fritekst: string): void => {
        sendForhåndsvarsel({ skalSendesForhåndsvarsel: SkalSendesForhåndsvarsel.Ja, fritekst });
        nullstillIkkePersisterteKomponenter();
    };

    const getFormId = (): string | undefined => {
        if (!skalSendesForhåndsvarsel) return undefined;

        if (skalSendesForhåndsvarsel === SkalSendesForhåndsvarsel.Ja) {
            if (!varselErSendt) return 'opprettForm';
            return 'uttalelseForm';
        }

        return 'unntakForm';
    };

    const handleNesteClick = (): void => {
        if (!skalSendesForhåndsvarsel) {
            setRadioError('Du må velge om forhåndsvarselet skal sendes eller ikke');
            return;
        }
        navigerTilNeste();
    };

    const formId = getFormId();

    const erJaFlyt = skalSendesForhåndsvarsel === SkalSendesForhåndsvarsel.Ja;
    const erNeiFlyt = skalSendesForhåndsvarsel === SkalSendesForhåndsvarsel.Nei;

    return (
        <VStack gap="space-24">
            <RadioGroup
                size="small"
                readOnly={varselErSendt || behandlingILesemodus}
                className="max-w-xl"
                legend="Skal det sendes forhåndsvarsel om tilbakekreving?"
                description="Brukeren skal som klar hovedregel varsles før vedtak om tilbakekreving fattes, slik at de får mulighet til å uttale seg."
                error={radioError}
                value={skalSendesForhåndsvarsel ?? ''}
                onChange={handleRadioChange}
            >
                <Radio value={SkalSendesForhåndsvarsel.Ja}>Ja</Radio>
                <Radio value={SkalSendesForhåndsvarsel.Nei}>Nei</Radio>
            </RadioGroup>

            {erJaFlyt && !varselErSendt && (
                <OpprettForhåndsvarsel
                    varselbrevtekster={varselbrevtekster}
                    onBekreft={bekreftSendForhåndsvarsel}
                    isPending={sendForhåndsvarselMutation.isPending}
                />
            )}

            {erJaFlyt && varselErSendt && (
                <FormProvider {...uttalelseMethods}>
                    <UttalelseEtterVarsel
                        handleUttalelseSubmit={handleUttalelseSubmit}
                        fristErUtsatt={fristErUtsatt}
                    />
                </FormProvider>
            )}

            {erNeiFlyt && (
                <FormProvider {...uttalelseMethods}>
                    <UnntakMedUttalelse
                        forhåndsvarselInfo={forhåndsvarselInfo}
                        onSubmit={(
                            unntakData: UnntakFormData | null,
                            uttalelseData: UttalelseFormData | null
                        ) => {
                            if (unntakData) {
                                sendUnntak(unntakData);
                            }
                            if (uttalelseData) {
                                sendBrukeruttalelse(uttalelseData, false);
                            }
                            nullstillIkkePersisterteKomponenter();
                        }}
                        navigerTilNeste={navigerTilNeste}
                        onDirtyChange={setNeiFlytIsDirty}
                    />
                </FormProvider>
            )}

            <ActionBar
                stegtekst={actionBarStegtekst('FORHÅNDSVARSEL')}
                nesteTekst={getNesteKnappTekst()}
                isLoading={
                    sendForhåndsvarselMutation.isPending ||
                    sendBrukeruttalelseMutation.isPending ||
                    sendUnntakMutation?.isPending
                }
                forrigeAriaLabel="Gå til fakta om feilutbetaling"
                onForrige={navigerTilForrige}
                nesteAriaLabel={getNesteKnappTekst()}
                {...(formId
                    ? {
                          type: 'submit' as const,
                          formId: formId,
                      }
                    : {
                          type: 'button' as const,
                          onNeste: handleNesteClick,
                      })}
            />

            {mutations.map(({ key, mutation }) => {
                if (mutation?.isError) {
                    const feil = extractErrorFromMutationError(mutation.error);
                    return <FeilModal key={key} feil={feil} lukkFeilModal={mutation.reset} />;
                }
                return null;
            })}
        </VStack>
    );
};
