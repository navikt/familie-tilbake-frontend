import type { ForhåndsvarselDto } from '../../../../generated';
import type { ForhåndsvarselFormData, UttalelseFormData } from '../schema';
import type { SubmitHandler } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { VStack } from '@navikt/ds-react';
import React from 'react';
import { useEffect, useEffectEvent } from 'react';
import { FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form';

import { useBehandlingState } from '../../../../context/BehandlingStateContext';
import { FeilModal } from '../../../../komponenter/modal/feil/FeilModal';
import { useVisGlobalAlert } from '../../../../stores/globalAlertStore';
import { HarUttaltSeg } from '../schema';
import {
    getUttalelseValues,
    getUttalelseValuesBasertPåValg,
    SkalSendesForhåndsvarsel,
    uttalelseSchema,
} from '../schema';
import {
    extractErrorFromMutationError,
    useForhåndsvarselMutations,
} from '../useForhåndsvarselMutations';
import { useForhåndsvarselQueries } from '../useForhåndsvarselQueries';
import { SkalSendeSkjema } from './SkalSendeSkjema';
import { Uttalelse } from './UttalelseSkjema';
import { ActionBar } from '../../../../komponenter/action-bar/ActionBar';

type Props = {
    forhåndsvarselInfo: ForhåndsvarselDto | undefined;
    skalSendesForhåndsvarsel: SkalSendesForhåndsvarsel;
};

export const ForhåndsvarselSkjema: React.FC<Props> = ({
    forhåndsvarselInfo,
    skalSendesForhåndsvarsel,
}) => {
    const { actionBarStegtekst, nullstillIkkePersisterteKomponenter } = useBehandlingState();
    const visGlobalAlert = useVisGlobalAlert();
    const {
        formState: { dirtyFields: forhåndsvarselDirtyFields },
    } = useFormContext<ForhåndsvarselFormData>();
    const forhåndsvarselIsDirty = Object.keys(forhåndsvarselDirtyFields).length > 0;

    const begrunnelseForUnntak = useWatch({
        control: useFormContext<ForhåndsvarselFormData>().control,
        name: 'begrunnelseForUnntak',
    });

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

    const getOppdatertUttalelseValues = useEffectEvent((harUttaltSeg: HarUttaltSeg) => {
        if (harUttaltSeg && harUttaltSeg === initialUttalelseValues.harUttaltSeg) {
            uttalelseMethods.reset(
                getUttalelseValuesBasertPåValg(harUttaltSeg, forhåndsvarselInfo)
            );
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

    const uttalelseIsDirty = Object.keys(uttalelseMethods.formState.dirtyFields).length > 0;

    type SubmitAction =
        | 'NAVIGER'
        | 'SEND_FORHÅNDSVARSEL'
        | 'SEND_UNNTAK_OG_UTTALELSE'
        | 'SEND_UNNTAK'
        | 'SEND_UTTALELSE'
        | 'UTSETT_FRIST';

    const skalSendeForhåndsvarsel =
        skalSendesForhåndsvarsel === SkalSendesForhåndsvarsel.Ja && !varselErSendt;

    const getSubmitAction = (): SubmitAction => {
        if (harUttaltSeg === HarUttaltSeg.UtsettFrist) {
            return 'UTSETT_FRIST';
        }
        if (skalSendeForhåndsvarsel) {
            return 'SEND_FORHÅNDSVARSEL';
        }

        const uttalelseErLagret = !!forhåndsvarselInfo?.brukeruttalelse;
        const uttalelseMåSendes =
            uttalelseIsDirty ||
            (begrunnelseForUnntak === 'ÅPENBART_UNØDVENDIG' && !uttalelseErLagret);

        const erUnntakFlyt =
            !varselErSendt && skalSendesForhåndsvarsel === SkalSendesForhåndsvarsel.Nei;
        if (erUnntakFlyt) {
            if (forhåndsvarselIsDirty && uttalelseMåSendes) {
                return 'SEND_UNNTAK_OG_UTTALELSE';
            }
            if (forhåndsvarselIsDirty) {
                return 'SEND_UNNTAK';
            }
            if (uttalelseMåSendes) {
                return 'SEND_UTTALELSE';
            }
        }

        if (varselErSendt && uttalelseIsDirty) {
            return 'SEND_UTTALELSE';
        }

        return 'NAVIGER';
    };

    const getNesteKnappTekst = (action: SubmitAction): string => {
        switch (action) {
            case 'UTSETT_FRIST':
                return 'Utsett frist';
            case 'SEND_FORHÅNDSVARSEL':
                return 'Send forhåndsvarsel';
            case 'NAVIGER':
                return 'Neste';
            default:
                return 'Lagre og gå til neste';
        }
    };

    const submitAction = getSubmitAction();

    const validerUttalelseSkjema = async (): Promise<boolean> => {
        let isValid = false;
        await uttalelseMethods.handleSubmit(
            () => {
                isValid = true;
            },
            () => {
                isValid = false;
            }
        )();
        return isValid;
    };

    const handleForhåndsvarselSubmit: SubmitHandler<ForhåndsvarselFormData> = async (
        data: ForhåndsvarselFormData
    ): Promise<void> => {
        switch (submitAction) {
            case 'SEND_FORHÅNDSVARSEL':
                sendForhåndsvarsel(data);
                break;
            case 'SEND_UNNTAK':
                sendUnntak(data);
                break;
            case 'SEND_UNNTAK_OG_UTTALELSE':
            case 'SEND_UTTALELSE': {
                const uttalelseValid = await validerUttalelseSkjema();
                if (!uttalelseValid) return;
                if (submitAction === 'SEND_UNNTAK_OG_UTTALELSE') {
                    sendUnntak(data);
                }
                sendBrukeruttalelse(uttalelseMethods.getValues());
                break;
            }
            case 'NAVIGER':
                navigerTilNeste();
                break;
        }
        nullstillIkkePersisterteKomponenter();
    };

    const handleUttalelseSubmit: SubmitHandler<UttalelseFormData> = (
        data: UttalelseFormData
    ): void => {
        if (submitAction === 'NAVIGER') {
            navigerTilNeste();
            return;
        }
        if (harUttaltSeg === HarUttaltSeg.UtsettFrist) {
            sendUtsettUttalelseFrist(data);
        }
        sendBrukeruttalelse(data);
    };

    const formId = ((): 'opprettForm' | 'uttalelseForm' | undefined => {
        if (varselErSendt) {
            return 'uttalelseForm';
        }
        return 'opprettForm';
    })();

    const skalViseUttalelseSkjema =
        varselErSendt ||
        (skalSendesForhåndsvarsel === SkalSendesForhåndsvarsel.Nei &&
            begrunnelseForUnntak === 'ÅPENBART_UNØDVENDIG');

    return (
        <VStack gap="space-24">
            <SkalSendeSkjema
                varselbrevtekster={varselbrevtekster}
                varselErSendt={varselErSendt}
                handleForhåndsvarselSubmit={handleForhåndsvarselSubmit}
            />

            {forhåndsvarselInfo && skalViseUttalelseSkjema && (
                <FormProvider {...uttalelseMethods}>
                    <Uttalelse
                        handleUttalelseSubmit={handleUttalelseSubmit}
                        kanUtsetteFrist
                        varselErSendt={varselErSendt}
                    />
                </FormProvider>
            )}

            <ActionBar
                stegtekst={actionBarStegtekst('FORHÅNDSVARSEL')}
                nesteTekst={getNesteKnappTekst(submitAction)}
                isLoading={
                    sendForhåndsvarselMutation.isPending ||
                    sendBrukeruttalelseMutation.isPending ||
                    sendUnntakMutation?.isPending
                }
                forrigeAriaLabel="Gå til fakta om feilutbetaling"
                onForrige={navigerTilForrige}
                nesteAriaLabel={getNesteKnappTekst(submitAction)}
                {...(formId
                    ? {
                          type: 'submit' as const,
                          formId: formId,
                      }
                    : {
                          type: 'button' as const,
                          onNeste: navigerTilNeste,
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
