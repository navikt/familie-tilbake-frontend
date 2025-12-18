import type { ForhåndsvarselFormData, UttalelseMedFristFormData } from './forhåndsvarselSchema';
import type { SubmitHandler } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { MegaphoneIcon } from '@navikt/aksel-icons';
import { Heading, HStack, Radio, RadioGroup, Tag, Tooltip, VStack } from '@navikt/ds-react';
import { ATextWidthMax } from '@navikt/ds-tokens/dist/tokens';
import { differenceInWeeks } from 'date-fns/differenceInWeeks';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';

import { Brukeruttalelse } from './Brukeruttalelse';
import {
    forhåndsvarselSchema,
    HarUttaltSeg,
    SkalSendesForhåndsvarsel,
    uttalelseMedFristSchema,
} from './forhåndsvarselSchema';
import { Opprett } from './Opprett';
// import { Unntak } from './Unntak';
import {
    extractErrorFromMutationError,
    useForhåndsvarselMutations,
} from './useForhåndsvarselMutations';
import { useForhåndsvarselQueries } from './useForhåndsvarselQueries';
import { useBehandling } from '../../../context/BehandlingContext';
import { HarBrukerUttaltSegEnum, type BehandlingDto, type FagsakDto } from '../../../generated';
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
        <ForhåndsvarselSkjema
            behandling={behandling}
            fagsak={fagsak}
            forhåndsvarselInfo={forhåndsvarselInfo}
        />
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
    const [parentBounds, setParentBounds] = useState({ width: 'auto' });

    const { actionBarStegtekst } = useBehandling();

    const {
        sendForhåndsvarselMutation,
        sendBrukeruttalelseMutation,
        sendForhåndsvarsel,
        sendBrukeruttalelse,
        sendUtsettUttalelseFristMutation,
        gåTilNeste,
    } = useForhåndsvarselMutations(behandling, fagsak);

    const mutations = [
        { key: 'forhåndsvarsel', mutation: sendForhåndsvarselMutation },
        { key: 'brukeruttalelse', mutation: sendBrukeruttalelseMutation },
        { key: 'utsettFrist', mutation: sendUtsettUttalelseFristMutation },
    ] as const;

    const { varselbrevtekster } = useForhåndsvarselQueries(behandling);

    const varselErSendt = !!forhåndsvarselInfo?.varselbrevSendtTid;

    const getForhåndsvarselStatus = (): SkalSendesForhåndsvarsel => {
        if (varselErSendt) {
            return SkalSendesForhåndsvarsel.Ja;
        }
        /* if (unntak !== undefined) {
            return SkalSendesForhåndsvarsel.Nei;
        } */
        return SkalSendesForhåndsvarsel.IkkeValgt;
    };

    const getUttalelseValues = (): UttalelseMedFristFormData => {
        const utsettUttalelseFrist = forhåndsvarselInfo?.utsettUttalelseFrist;
        if (utsettUttalelseFrist.length > 0) {
            return {
                harUttaltSeg: HarUttaltSeg.UtsettFrist,
                utsettUttalelseFrist: {
                    nyFrist:
                        forhåndsvarselInfo.utsettUttalelseFrist[
                            forhåndsvarselInfo.utsettUttalelseFrist.length - 1
                        ]?.nyFrist ?? '',
                    begrunnelse:
                        forhåndsvarselInfo.utsettUttalelseFrist[
                            forhåndsvarselInfo.utsettUttalelseFrist.length - 1
                        ]?.begrunnelse ?? '',
                },
            };
        }
        const brukerUttalelse = forhåndsvarselInfo?.brukeruttalelse;
        const uttalelsesdetaljer = brukerUttalelse?.uttalelsesdetaljer
            ? [brukerUttalelse.uttalelsesdetaljer[brukerUttalelse.uttalelsesdetaljer.length - 1]]
            : [];

        if (brukerUttalelse?.harBrukerUttaltSeg) {
            switch (brukerUttalelse?.harBrukerUttaltSeg) {
                case HarBrukerUttaltSegEnum.JA:
                    return {
                        harUttaltSeg: HarUttaltSeg.Ja,
                        uttalelsesDetaljer: uttalelsesdetaljer ?? [
                            {
                                hvorBrukerenUttalteSeg: '',
                                uttalelseBeskrivelse: '',
                                uttalelsesdato: '',
                            },
                        ],
                    };
                case HarBrukerUttaltSegEnum.NEI:
                    return {
                        harUttaltSeg: HarUttaltSeg.Nei,
                        kommentar: forhåndsvarselInfo.brukeruttalelse?.kommentar ?? '',
                    };
            }
        }

        return {
            harUttaltSeg: HarUttaltSeg.IkkeValgt,
        };
    };

    const getOpprettValues = (): ForhåndsvarselFormData => {
        return {
            skalSendesForhåndsvarsel: SkalSendesForhåndsvarsel.Ja,
            fritekst: '',
        };
    };

    const getUnntakValues = (): ForhåndsvarselFormData => {
        // const brukerUttalelse = forhåndsvarselInfo?.brukeruttalelse;
        // const harBrukerUttaltSegVerdi = brukerUttalelse?.harBrukerUttaltSeg;
        // const utsettelsesdetaljer = brukerUttalelse?.uttalelsesdetaljer
        //     ? [brukerUttalelse.uttalelsesdetaljer[brukerUttalelse.uttalelsesdetaljer.length - 1]]
        //     : [];
        // if (harBrukerUttaltSegVerdi) {
        //     const brukerUttalelse = mapHarBrukerUttaltSegFraApiDto(harBrukerUttaltSegVerdi);
        //     if (brukerUttalelse === HarBrukerUttaltSeg.Ja) {
        //         return {
        //             skalSendesForhåndsvarsel: SkalSendesForhåndsvarsel.Nei,
        //             harBrukerUttaltSeg: {
        //                 harBrukerUttaltSeg: HarBrukerUttaltSeg.Ja,
        //                 uttalelsesDetaljer: utsettelsesdetaljer,
        //             },
        //         };
        //     } else if (brukerUttalelse === HarBrukerUttaltSeg.Nei) {
        //         return {
        //             skalSendesForhåndsvarsel: SkalSendesForhåndsvarsel.Nei,
        //             harBrukerUttaltSeg: {
        //                 harBrukerUttaltSeg: HarBrukerUttaltSeg.Nei,
        //                 kommentar: forhåndsvarselInfo.brukeruttalelse?.kommentar ?? '',
        //             },
        //         };
        //     }
        // }

        return {
            skalSendesForhåndsvarsel: SkalSendesForhåndsvarsel.Nei,
        };
    };

    const getDefaultValues = (): ForhåndsvarselFormData => {
        switch (getForhåndsvarselStatus()) {
            case SkalSendesForhåndsvarsel.Ja:
                return getOpprettValues();
            case SkalSendesForhåndsvarsel.Nei:
                return getUnntakValues();
            default:
                return {
                    skalSendesForhåndsvarsel: SkalSendesForhåndsvarsel.IkkeValgt,
                };
        }
    };

    const methods = useForm<ForhåndsvarselFormData>({
        resolver: zodResolver(forhåndsvarselSchema),
        mode: 'all',
        shouldFocusError: false,
        defaultValues: getDefaultValues(),
    });
    const uttalelseMethods = useForm<UttalelseMedFristFormData>({
        resolver: zodResolver(uttalelseMedFristSchema),
        mode: 'all',
        shouldFocusError: false,
        defaultValues: getUttalelseValues(),
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

    const handleFormSubmit: SubmitHandler<ForhåndsvarselFormData | UttalelseMedFristFormData> = (
        data: ForhåndsvarselFormData | UttalelseMedFristFormData
    ): void => {
        if (varselErSendt) {
            sendBrukeruttalelse(data as UttalelseMedFristFormData);
        }
        // else if (harBrukerUttaltSeg === HarBrukerUttaltSeg.UtsettFrist) {
        //     sendUtsettUttalelseFrist(data);
        // }
        else if (!varselErSendt && methods.formState.isDirty) {
            sendForhåndsvarsel(data as ForhåndsvarselFormData);
        } else {
            gåTilNeste();
        }
    };

    const getNesteKnappTekst = (): string => {
        // if (harBrukerUttaltSeg === HarBrukerUttaltSeg.UtsettFrist) {
        //     return 'Utsett frist';
        // } else
        if (
            !varselErSendt &&
            methods.formState.isDirty &&
            skalSendesForhåndsvarsel === SkalSendesForhåndsvarsel.Ja
        ) {
            return 'Send forhåndsvarsel';
        }
        return 'Neste';
    };

    return (
        <>
            <FormProvider {...methods}>
                <VStack as="form" gap="6" onSubmit={methods.handleSubmit(handleFormSubmit)}>
                    <HStack align="center" justify="space-between">
                        <Heading level="1" size="small">
                            Forhåndsvarsel
                        </Heading>
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
                    <VStack maxWidth={ATextWidthMax} ref={containerRef}>
                        <Controller
                            control={methods.control}
                            name="skalSendesForhåndsvarsel"
                            render={({ field, fieldState }) => (
                                <RadioGroup
                                    {...field}
                                    size="small"
                                    legend="Skal det sendes forhåndsvarsel om tilbakekreving?"
                                    description="Brukeren skal som klar hovedregel varsles før vedtak om tilbakekreving
                fattes, slik at de får mulighet til å uttale seg."
                                    readOnly={varselErSendt}
                                    error={fieldState.error?.message}
                                >
                                    <Radio value={SkalSendesForhåndsvarsel.Ja}>Ja</Radio>
                                    <Radio value={SkalSendesForhåndsvarsel.Nei}>Nei</Radio>
                                </RadioGroup>
                            )}
                        />
                    </VStack>
                    {skalSendesForhåndsvarsel === SkalSendesForhåndsvarsel.Ja &&
                        varselbrevtekster && (
                            <Opprett
                                behandling={behandling}
                                fagsak={fagsak}
                                varselbrevtekster={varselbrevtekster}
                                varselErSendt={varselErSendt}
                                parentBounds={parentBounds}
                            />
                        )}
                    {/* {skalSendesForhåndsvarsel === SkalSendesForhåndsvarsel.Nei && <Unntak />} */}

                    <ActionBar
                        stegtekst={actionBarStegtekst(Behandlingssteg.Forhåndsvarsel)}
                        nesteTekst={getNesteKnappTekst()}
                        isLoading={
                            sendForhåndsvarselMutation.isPending ||
                            sendBrukeruttalelseMutation.isPending
                        }
                        forrigeAriaLabel={undefined}
                        onForrige={undefined}
                        nesteAriaLabel={getNesteKnappTekst()}
                        type="submit"
                    />
                </VStack>
            </FormProvider>

            {varselErSendt && (
                <FormProvider {...uttalelseMethods}>
                    <Brukeruttalelse behandling={behandling} fagsak={fagsak} kanUtsetteFrist />
                </FormProvider>
            )}

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
