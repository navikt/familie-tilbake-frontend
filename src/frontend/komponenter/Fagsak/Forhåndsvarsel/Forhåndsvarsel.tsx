import type { ForhåndsvarselFormData, UttalelseMedFristFormData } from './forhåndsvarselSchema';
import type { ForhåndsvarselDto } from '../../../generated';
import type { BehandlingDto } from '../../../generated';
import type { SubmitHandler } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { MegaphoneIcon } from '@navikt/aksel-icons';
import { Heading, HStack, Tag, Tooltip, VStack } from '@navikt/ds-react';
import { differenceInWeeks } from 'date-fns/differenceInWeeks';
import React, { useEffect, useEffectEvent, useLayoutEffect, useRef, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

import {
    forhåndsvarselSchema,
    getDefaultValues,
    HarUttaltSeg,
    SkalSendesForhåndsvarsel,
    uttalelseMedFristSchema,
    getUttalelseValues,
    getUttalelseValuesBasertPåValg,
} from './forhåndsvarselSchema';
import { OpprettSkjema } from './skjema/OpprettSkjema';
import { Uttalelse } from './skjema/UttalelseSkjema';
import {
    extractErrorFromMutationError,
    useForhåndsvarselMutations,
} from './useForhåndsvarselMutations';
import { useForhåndsvarselQueries } from './useForhåndsvarselQueries';
import { useBehandling } from '../../../context/BehandlingContext';
import { ToggleName } from '../../../context/toggles';
import { useToggles } from '../../../context/TogglesContext';
import { Behandlingssteg } from '../../../typer/behandling';
import { formatterDatostring, formatterRelativTid } from '../../../utils';
import { updateParentBounds } from '../../../utils/updateParentBounds';
import { FixedAlert } from '../../Felleskomponenter/FixedAlert/FixedAlert';
import { FeilModal } from '../../Felleskomponenter/Modal/Feil/FeilModal';
import { ActionBar } from '../ActionBar/ActionBar';

type Props = {
    behandling: BehandlingDto;
};

type TagVariant = 'info-moderate' | 'success-moderate';

const getTagVariant = (sendtTid: string): TagVariant => {
    const ukerSiden = differenceInWeeks(new Date(), new Date(sendtTid));
    return ukerSiden >= 3 ? 'success-moderate' : 'info-moderate';
};

export const Forhåndsvarsel: React.FC<Props> = ({ behandling }) => {
    const { forhåndsvarselInfo } = useForhåndsvarselQueries(behandling);

    return (
        <VStack gap="4">
            <HStack align="center" justify="space-between">
                <Heading size="small">Forhåndsvarsel</Heading>
                {forhåndsvarselInfo?.varselbrevDto?.varselbrevSendtTid && (
                    <Tooltip
                        arrow={false}
                        placement="bottom"
                        content={`Sendt ${formatterDatostring(forhåndsvarselInfo.varselbrevDto.varselbrevSendtTid)}`}
                    >
                        <Tag
                            variant={getTagVariant(
                                forhåndsvarselInfo.varselbrevDto.varselbrevSendtTid
                            )}
                            icon={<MegaphoneIcon aria-hidden />}
                        >
                            {`Sendt ${formatterRelativTid(forhåndsvarselInfo.varselbrevDto.varselbrevSendtTid)}`}
                        </Tag>
                    </Tooltip>
                )}
            </HStack>
            <ForhåndsvarselSkjema behandling={behandling} forhåndsvarselInfo={forhåndsvarselInfo} />
        </VStack>
    );
};

type ForhåndsvarselSkjemaProps = {
    behandling: BehandlingDto;
    forhåndsvarselInfo: ForhåndsvarselDto | undefined;
};

export const ForhåndsvarselSkjema: React.FC<ForhåndsvarselSkjemaProps> = ({
    behandling,
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
        sendUnntakMutation,
        sendUnntak,
        gåTilNeste,
    } = useForhåndsvarselMutations(behandling);

    const mutations = [
        { key: 'forhåndsvarsel', mutation: sendForhåndsvarselMutation },
        { key: 'brukeruttalelse', mutation: sendBrukeruttalelseMutation },
        { key: 'utsettFrist', mutation: sendUtsettUttalelseFristMutation },
        { key: 'unntak', mutation: sendUnntakMutation },
    ] as const;

    const { varselbrevtekster } = useForhåndsvarselQueries(behandling);

    const varselErSendt = !!forhåndsvarselInfo?.varselbrevDto?.varselbrevSendtTid;

    const methods = useForm<ForhåndsvarselFormData>({
        resolver: zodResolver(forhåndsvarselSchema),
        mode: 'all',
        defaultValues: getDefaultValues(varselErSendt, forhåndsvarselInfo),
    });
    const uttalelseMethods = useForm<UttalelseMedFristFormData>({
        resolver: zodResolver(uttalelseMedFristSchema),
        mode: 'all',
        defaultValues: getUttalelseValues(forhåndsvarselInfo),
    });

    const harUttaltSeg = useWatch({
        control: uttalelseMethods.control,
        name: 'harUttaltSeg',
    });

    const getOppdatertUttalelseValues = useEffectEvent((harUttaltSeg: HarUttaltSeg) => {
        if (harUttaltSeg) {
            uttalelseMethods.reset(
                getUttalelseValuesBasertPåValg(harUttaltSeg, forhåndsvarselInfo)
            );
        }
    });

    useEffect(() => {
        getOppdatertUttalelseValues(harUttaltSeg);
    }, [harUttaltSeg]);

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
        } else if (!varselErSendt && skalSendesForhåndsvarsel === SkalSendesForhåndsvarsel.Ja) {
            return 'Send forhåndsvarsel';
        } else if (skalSendesForhåndsvarsel === SkalSendesForhåndsvarsel.Nei) {
            return 'Send inn unntak';
        }
        return 'Neste';
    };

    const handleForhåndsvarselSubmit: SubmitHandler<ForhåndsvarselFormData> = (
        data: ForhåndsvarselFormData
    ): void => {
        if (skalSendesForhåndsvarsel === SkalSendesForhåndsvarsel.Ja && !varselErSendt) {
            sendForhåndsvarsel(data);
        } else if (skalSendesForhåndsvarsel === SkalSendesForhåndsvarsel.Nei) {
            sendUnntak(data);
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
                    varselbrevtekster={varselbrevtekster}
                    varselErSendt={varselErSendt}
                    parentBounds={parentBounds}
                    handleForhåndsvarselSubmit={handleForhåndsvarselSubmit}
                    readOnly={forhåndsvarselInfo?.forhåndsvarselUnntak !== undefined}
                />
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
                    sendForhåndsvarselMutation.isPending ||
                    sendBrukeruttalelseMutation.isPending ||
                    sendUnntakMutation?.isPending
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
                if (mutation?.isError) {
                    const feil = extractErrorFromMutationError(mutation.error);
                    return (
                        <FeilModal
                            key={key}
                            feil={feil}
                            lukkFeilModal={mutation.reset}
                            behandlingId={behandling.behandlingId}
                        />
                    );
                }
                return null;
            })}
        </>
    );
};
