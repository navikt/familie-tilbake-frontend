import type { ForhåndsvarselFormData, UttalelseMedFristFormData } from './forhåndsvarselSchema';
import type { SubmitHandler } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { MegaphoneIcon } from '@navikt/aksel-icons';
import { Heading, HStack, Tag, Tooltip, VStack } from '@navikt/ds-react';
import { differenceInWeeks } from 'date-fns/differenceInWeeks';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

import {
    forhåndsvarselSchema,
    getDefaultValues,
    HarUttaltSeg,
    SkalSendesForhåndsvarsel,
    uttalelseMedFristSchema,
    getUttalelseValues,
} from './forhåndsvarselSchema';
import { OpprettSkjema } from './skjema/OpprettSkjema';
import { Uttalelse } from './skjema/UttalelseSkjema';
// import { Unntak } from './Unntak';
import {
    extractErrorFromMutationError,
    useForhåndsvarselMutations,
} from './useForhåndsvarselMutations';
import { useForhåndsvarselQueries } from './useForhåndsvarselQueries';
import { useBehandling } from '../../../context/BehandlingContext';
import { ToggleName } from '../../../context/toggles';
import { useToggles } from '../../../context/TogglesContext';
import { type BehandlingDto, type FagsakDto } from '../../../generated';
import { Behandlingssteg } from '../../../typer/behandling';
import { formatterDatostring, formatterRelativTid } from '../../../utils';
import { updateParentBounds } from '../../../utils/updateParentBounds';
import { FixedAlert } from '../../Felleskomponenter/FixedAlert/FixedAlert';
import { FeilModal } from '../../Felleskomponenter/Modal/Feil/FeilModal';
import { ActionBar } from '../ActionBar/ActionBar';

type Props = {
    behandling: BehandlingDto;
    fagsak: FagsakDto;
};

type TagVariant = 'info-moderate' | 'success-moderate';

const getTagVariant = (sendtTid: string): TagVariant => {
    const ukerSiden = differenceInWeeks(new Date(), new Date(sendtTid));
    return ukerSiden >= 3 ? 'success-moderate' : 'info-moderate';
};

export const Forhåndsvarsel: React.FC<Props> = ({ behandling, fagsak }) => {
    const { forhåndsvarselInfo } = useForhåndsvarselQueries(behandling);

    return (
        <VStack gap="4">
            <HStack align="center" justify="space-between">
                <Heading size="small">Forhåndsvarsel</Heading>
                {forhåndsvarselInfo?.varselbrevSendtTid && (
                    <Tooltip
                        arrow={false}
                        placement="bottom"
                        content={`Sendt ${formatterDatostring(forhåndsvarselInfo.varselbrevSendtTid)}`}
                    >
                        <Tag
                            variant={getTagVariant(forhåndsvarselInfo.varselbrevSendtTid)}
                            icon={<MegaphoneIcon aria-hidden />}
                        >
                            {`Sendt ${formatterRelativTid(forhåndsvarselInfo.varselbrevSendtTid)}`}
                        </Tag>
                    </Tooltip>
                )}
            </HStack>
            <ForhåndsvarselSkjema
                behandling={behandling}
                fagsak={fagsak}
                forhåndsvarselInfo={forhåndsvarselInfo}
            />
        </VStack>
    );
};

type ForhåndsvarselSkjemaProps = {
    behandling: BehandlingDto;
    fagsak: FagsakDto;
    forhåndsvarselInfo: NonNullable<
        ReturnType<typeof useForhåndsvarselQueries>['forhåndsvarselInfo']
    >;
};

export const ForhåndsvarselSkjema: React.FC<ForhåndsvarselSkjemaProps> = ({
    behandling,
    fagsak,
    forhåndsvarselInfo,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { toggles } = useToggles();
    const [parentBounds, setParentBounds] = useState({ width: 'auto' });

    const { actionBarStegtekst } = useBehandling();

    const {
        sendForhåndsvarselMutation,
        sendBrukeruttalelseMutation,
        sendUtsettUttalelseFristMutation,
        sendUtsettUttalelseFrist,
        sendBrukeruttalelse,
        sendForhåndsvarsel,
        gåTilNeste,
    } = useForhåndsvarselMutations(behandling, fagsak);

    const mutations = [
        { key: 'forhåndsvarsel', mutation: sendForhåndsvarselMutation },
        { key: 'brukeruttalelse', mutation: sendBrukeruttalelseMutation },
        { key: 'utsettFrist', mutation: sendUtsettUttalelseFristMutation },
    ] as const;

    const { varselbrevtekster } = useForhåndsvarselQueries(behandling);

    const varselErSendt = !!forhåndsvarselInfo?.varselbrevSendtTid;

    const methods = useForm<ForhåndsvarselFormData>({
        resolver: zodResolver(forhåndsvarselSchema),
        mode: 'all',
        shouldFocusError: false,
        defaultValues: getDefaultValues(varselErSendt),
    });
    const uttalelseMethods = useForm<UttalelseMedFristFormData>({
        resolver: zodResolver(uttalelseMedFristSchema),
        mode: 'all',
        shouldFocusError: false,
        defaultValues: getUttalelseValues(forhåndsvarselInfo),
    });

    const harUttaltSeg = useWatch({
        control: uttalelseMethods.control,
        name: 'harUttaltSeg',
    });

    useLayoutEffect(() => {
        updateParentBounds(containerRef, setParentBounds);
        window.addEventListener('resize', () => updateParentBounds(containerRef, setParentBounds));

        return (): void =>
            window.removeEventListener('resize', () =>
                updateParentBounds(containerRef, setParentBounds)
            );
    }, []);

    const skalSendesForhåndsvarsel = useWatch({
        control: methods.control,
        name: 'skalSendesForhåndsvarsel',
    });

    const getNesteKnappTekst = (): string => {
        if (harUttaltSeg === HarUttaltSeg.UtsettFrist) {
            return 'Utsett frist';
        } else if (
            !varselErSendt &&
            methods.formState.isDirty &&
            skalSendesForhåndsvarsel === SkalSendesForhåndsvarsel.Ja
        ) {
            return 'Send forhåndsvarsel';
        }
        return 'Neste';
    };

    const handleForhåndsvarselSubmit: SubmitHandler<ForhåndsvarselFormData> = (
        data: ForhåndsvarselFormData
    ): void => {
        if (!varselErSendt) {
            sendForhåndsvarsel(data);
        } else {
            gåTilNeste();
        }
    };

    const handleUttalelseSubmit: SubmitHandler<UttalelseMedFristFormData> = (
        data: UttalelseMedFristFormData
    ): void => {
        if (harUttaltSeg === HarUttaltSeg.UtsettFrist) {
            sendUtsettUttalelseFrist(data);
        }
        sendBrukeruttalelse(data);
    };

    return (
        <>
            <FormProvider {...methods}>
                <OpprettSkjema
                    behandling={behandling}
                    fagsak={fagsak}
                    varselbrevtekster={varselbrevtekster}
                    varselErSendt={varselErSendt}
                    parentBounds={parentBounds}
                    handleForhåndsvarselSubmit={handleForhåndsvarselSubmit}
                />
                {/* {skalSendesForhåndsvarsel === SkalSendesForhåndsvarsel.Nei && <Unntak />} */}
            </FormProvider>

            {toggles[ToggleName.Forhåndsvarselsteg] && varselErSendt && (
                <FormProvider {...uttalelseMethods}>
                    <Uttalelse handleUttalelseSubmit={handleUttalelseSubmit} kanUtsetteFrist />
                </FormProvider>
            )}

            <ActionBar
                stegtekst={actionBarStegtekst(Behandlingssteg.Forhåndsvarsel)}
                nesteTekst={getNesteKnappTekst()}
                isLoading={
                    sendForhåndsvarselMutation.isPending || sendBrukeruttalelseMutation.isPending
                }
                forrigeAriaLabel={undefined}
                onForrige={undefined}
                nesteAriaLabel={getNesteKnappTekst()}
                type="submit"
                formId={varselErSendt ? 'uttalelseForm' : 'opprettForm'}
            />

            {sendForhåndsvarselMutation.isSuccess && (
                <FixedAlert
                    aria-live="polite"
                    variant="success"
                    closeButton
                    width={parentBounds.width}
                    onClose={sendForhåndsvarselMutation.reset}
                >
                    <Heading spacing size="small" level="3">
                        Forhåndsvarsel er sendt
                    </Heading>
                    Du kan fortsette saksbehandlingen når bruker har uttalt seg, eller når fristen
                    for å uttale seg (3 uker) har gått ut.
                </FixedAlert>
            )}

            {mutations.map(({ key, mutation }) => {
                if (mutation.isError) {
                    const feil = extractErrorFromMutationError(mutation.error);
                    return (
                        <FeilModal
                            key={key}
                            feil={feil}
                            lukkFeilModal={mutation.reset}
                            behandlingId={behandling.behandlingId}
                            fagsakId={fagsak.eksternFagsakId}
                        />
                    );
                }
                return null;
            })}
        </>
    );
};
