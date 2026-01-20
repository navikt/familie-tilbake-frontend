import type { ForhåndsvarselFormData, UttalelseMedFristFormData } from './forhåndsvarselSchema';
import type { ForhåndsvarselDto, RessursByte, BehandlingDto } from '../../../generated';
import type { SubmitHandler } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { FilePdfIcon, MegaphoneIcon } from '@navikt/aksel-icons';
import { Button, Heading, HStack, Tag, Tooltip, VStack } from '@navikt/ds-react';
import { useQueryClient } from '@tanstack/react-query';
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
import PdfVisningModal from '../../Felleskomponenter/PdfVisningModal/PdfVisningModal';
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
    const { settIkkePersistertKomponent, nullstillIkkePersisterteKomponenter } = useBehandling();
    const { forhåndsvarselInfo } = useForhåndsvarselQueries(behandling);
    const { seForhåndsvisning, forhåndsvisning } = useForhåndsvarselMutations(behandling);
    const [showModal, setShowModal] = useState(false);
    const queryClient = useQueryClient();
    const containerRef = useRef<HTMLDivElement>(null);
    const [parentBounds, setParentBounds] = useState({ width: 'auto' });

    const varselErSendt = !!forhåndsvarselInfo?.varselbrevDto?.varselbrevSendtTid;

    const methods = useForm<ForhåndsvarselFormData>({
        resolver: zodResolver(forhåndsvarselSchema),
        mode: 'onSubmit',
        reValidateMode: 'onChange',
        criteriaMode: 'all',
        defaultValues: getDefaultValues(varselErSendt, forhåndsvarselInfo),
    });

    methods.subscribe({
        formState: { isDirty: true },
        callback: data => {
            if (data.isDirty) {
                settIkkePersistertKomponent('forhåndsvarsel');
            } else {
                nullstillIkkePersisterteKomponenter();
            }
        },
    });

    const fritekst = useWatch({
        control: methods.control,
        name: 'fritekst',
    });

    const skalSendesForhåndsvarsel = useWatch({
        control: methods.control,
        name: 'skalSendesForhåndsvarsel',
    });

    const handleMutationSuccess = useEffectEvent(
        (isSuccess: boolean, data: RessursByte | undefined) => {
            if (isSuccess && data) {
                const currentQueryKey = [
                    'forhåndsvisBrev',
                    behandling.behandlingId,
                    'VARSEL',
                    fritekst,
                ];
                queryClient.setQueryData(currentQueryKey, data);
                setShowModal(true);
            }
        }
    );

    useLayoutEffect(() => {
        updateParentBounds(containerRef, setParentBounds);
        window.addEventListener('resize', () => updateParentBounds(containerRef, setParentBounds));

        return (): void =>
            window.removeEventListener('resize', () =>
                updateParentBounds(containerRef, setParentBounds)
            );
    }, []);

    useEffect(() => {
        handleMutationSuccess(forhåndsvisning.isSuccess, forhåndsvisning.data);
    }, [forhåndsvisning.isSuccess, forhåndsvisning.data]);

    const seForhåndsvisningWithModal = (): void => {
        const currentQueryKey = ['forhåndsvisBrev', behandling.behandlingId, 'VARSEL', fritekst];

        const cachedData = queryClient.getQueryData(currentQueryKey);

        if (cachedData) {
            setShowModal(true);
        } else {
            seForhåndsvisning(fritekst);
        }
    };

    const pdfData =
        forhåndsvisning.data ||
        queryClient.getQueryData(['forhåndsvisBrev', behandling.behandlingId, 'VARSEL', fritekst]);

    return (
        <VStack gap="4">
            <HStack align="center" justify="space-between">
                <Heading size="small">Forhåndsvarsel</Heading>
                <HStack gap="4">
                    {skalSendesForhåndsvarsel === SkalSendesForhåndsvarsel.Ja && (
                        <Button
                            loading={forhåndsvisning.isPending}
                            icon={<FilePdfIcon aria-hidden />}
                            variant="tertiary"
                            size="small"
                            onClick={seForhåndsvisningWithModal}
                        >
                            Forhåndsvis
                        </Button>
                    )}
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
            </HStack>
            <FormProvider {...methods}>
                <ForhåndsvarselSkjema
                    ref={containerRef}
                    behandling={behandling}
                    forhåndsvarselInfo={forhåndsvarselInfo}
                    skalSendesForhåndsvarsel={skalSendesForhåndsvarsel}
                    parentBounds={parentBounds}
                />
            </FormProvider>
            {forhåndsvisning.error && (
                <FixedAlert
                    aria-live="assertive"
                    variant="error"
                    closeButton
                    width={parentBounds.width}
                    onClose={forhåndsvisning.reset}
                >
                    <Heading spacing size="small" level="3">
                        Forhåndsvisning feilet
                    </Heading>
                    {forhåndsvisning.error.message}
                </FixedAlert>
            )}
            {showModal && pdfData && (
                <PdfVisningModal
                    åpen
                    pdfdata={pdfData}
                    onRequestClose={() => setShowModal(false)}
                />
            )}
        </VStack>
    );
};

type ForhåndsvarselSkjemaProps = {
    behandling: BehandlingDto;
    forhåndsvarselInfo: ForhåndsvarselDto | undefined;
    skalSendesForhåndsvarsel: SkalSendesForhåndsvarsel;
    parentBounds: { width: string | undefined };
    ref: React.RefObject<HTMLDivElement | null>;
};

export const ForhåndsvarselSkjema: React.FC<ForhåndsvarselSkjemaProps> = ({
    behandling,
    forhåndsvarselInfo,
    skalSendesForhåndsvarsel,
    parentBounds,
    ref,
}) => {
    const { toggles } = useToggles();
    const { actionBarStegtekst, nullstillIkkePersisterteKomponenter } = useBehandling();

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
        gåTilForrige,
    } = useForhåndsvarselMutations(behandling);

    const mutations = [
        { key: 'forhåndsvarsel', mutation: sendForhåndsvarselMutation },
        { key: 'brukeruttalelse', mutation: sendBrukeruttalelseMutation },
        { key: 'utsettFrist', mutation: sendUtsettUttalelseFristMutation },
        { key: 'unntak', mutation: sendUnntakMutation },
    ] as const;

    const { varselbrevtekster } = useForhåndsvarselQueries(behandling);

    const varselErSendt = !!forhåndsvarselInfo?.varselbrevDto?.varselbrevSendtTid;

    const uttalelseMethods = useForm<UttalelseMedFristFormData>({
        resolver: zodResolver(uttalelseMedFristSchema),
        mode: 'onSubmit',
        reValidateMode: 'onChange',
        criteriaMode: 'all',
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

    const getNesteKnappTekst = (): string => {
        if (harUttaltSeg === HarUttaltSeg.UtsettFrist) {
            return 'Utsett frist';
        } else if (!varselErSendt && skalSendesForhåndsvarsel === SkalSendesForhåndsvarsel.Ja) {
            return 'Send forhåndsvarsel';
        }
        return 'Lagre og gå til neste';
    };

    const skalSendeForhåndsvarsel =
        skalSendesForhåndsvarsel === SkalSendesForhåndsvarsel.Ja && !varselErSendt;
    const skalSendeUnntak =
        skalSendesForhåndsvarsel === SkalSendesForhåndsvarsel.Nei &&
        !forhåndsvarselInfo?.forhåndsvarselUnntak;

    const handleForhåndsvarselSubmit: SubmitHandler<ForhåndsvarselFormData> = (
        data: ForhåndsvarselFormData
    ): void => {
        if (skalSendeForhåndsvarsel) {
            sendForhåndsvarsel(data);
        } else if (skalSendeUnntak) {
            sendUnntak(data);
        } else {
            gåTilNeste();
        }
        nullstillIkkePersisterteKomponenter();
    };

    const handleUttalelseSubmit: SubmitHandler<UttalelseMedFristFormData> = (
        data: UttalelseMedFristFormData
    ): void => {
        if (harUttaltSeg === HarUttaltSeg.UtsettFrist) {
            sendUtsettUttalelseFrist(data);
        }
        sendBrukeruttalelse(data);
    };

    const formId = !varselErSendt
        ? 'opprettForm'
        : varselErSendt && !forhåndsvarselInfo?.brukeruttalelse
          ? 'uttalelseForm'
          : skalSendeUnntak
            ? 'unntakForm'
            : undefined; // 'uttalelseUtenUtsettForm'; undefined hvis bare "Neste"

    return (
        <div ref={ref}>
            <OpprettSkjema
                behandling={behandling}
                varselbrevtekster={varselbrevtekster}
                varselErSendt={varselErSendt}
                handleForhåndsvarselSubmit={handleForhåndsvarselSubmit}
                readOnly={!!forhåndsvarselInfo?.forhåndsvarselUnntak}
            />

            {toggles[ToggleName.Forhåndsvarselsteg] && varselErSendt && (
                <FormProvider {...uttalelseMethods}>
                    <Uttalelse
                        handleUttalelseSubmit={handleUttalelseSubmit}
                        readOnly={
                            !!forhåndsvarselInfo.brukeruttalelse ||
                            forhåndsvarselInfo.utsettUttalelseFrist.length > 0
                        }
                        kanUtsetteFrist
                    />
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
                forrigeAriaLabel="Gå til fakta om feilutbetaling"
                onForrige={gåTilForrige}
                nesteAriaLabel={getNesteKnappTekst()}
                {...(formId
                    ? {
                          type: 'submit' as const,
                          formId: formId,
                      }
                    : {
                          type: 'button' as const,
                          onNeste: gåTilNeste,
                      })}
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
        </div>
    );
};
