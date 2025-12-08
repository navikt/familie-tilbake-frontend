import type { BehandlingDto, FagsakDto } from '../../../generated';

import { MegaphoneIcon } from '@navikt/aksel-icons';
import { Heading, HStack, Radio, RadioGroup, Tag, Tooltip, VStack } from '@navikt/ds-react';
import { ATextWidthMax } from '@navikt/ds-tokens/dist/tokens';
import { differenceInWeeks } from 'date-fns/differenceInWeeks';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { SkalSendesForhåndsvarsel, HarBrukerUttaltSeg } from './Enums';
import { ForhåndsvarselSkjema } from './ForhåndsvarselSkjema';
import { Unntak } from './Unntak';
import {
    mapHarBrukerUttaltSegFraApiDto,
    useForhåndsvarselMutations,
    type ForhåndsvarselFormData,
} from './useForhåndsvarselMutations';
import { useForhåndsvarselQueries } from './useForhåndsvarselQueries';
import { useBehandling } from '../../../context/BehandlingContext';
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
    const [visForhåndsvarselSendt, setVisForhåndsvarselSendt] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [parentBounds, setParentBounds] = useState({ width: 'auto' });

    const { actionBarStegtekst } = useBehandling();

    const {
        sendForhåndsvarselMutation,
        sendBrukeruttalelseMutation,
        sendForhåndsvarsel,
        sendBrukeruttalelse,
        sendUtsettUttalelseFrist,
        gåTilNeste,
    } = useForhåndsvarselMutations(behandling, fagsak, () => setVisForhåndsvarselSendt(true));

    const { forhåndsvarselInfo, varselbrevtekster } = useForhåndsvarselQueries(behandling);

    const varselErSendt = !!forhåndsvarselInfo?.varselbrevSendtTid;

    const getForhåndsvarselStatus = useCallback((): SkalSendesForhåndsvarsel => {
        if (varselErSendt) {
            return SkalSendesForhåndsvarsel.Ja;
        }
        return SkalSendesForhåndsvarsel.IkkeValgt;
    }, [varselErSendt]);

    const defaultValues = useMemo(
        () => ({
            skalSendesForhåndsvarsel: getForhåndsvarselStatus().toString(),
            fritekst: '',
            harBrukerUttaltSeg: mapHarBrukerUttaltSegFraApiDto(
                forhåndsvarselInfo?.brukeruttalelse?.harBrukerUttaltSeg
            ),
            uttalelsesKommentar: forhåndsvarselInfo?.brukeruttalelse?.kommentar || '',
            uttalelsesDetaljer: forhåndsvarselInfo?.brukeruttalelse?.uttalelsesdetaljer || '',
            uttalelsesdato: '',
            hvorBrukerenUttalteSeg: '',
            uttalelseBeskrivelse: '',
            nyFristDato: '',
            begrunnelseUtsattFrist: '',
        }),
        [forhåndsvarselInfo, getForhåndsvarselStatus]
    );

    const methods = useForm<ForhåndsvarselFormData>({
        reValidateMode: 'onBlur',
        shouldFocusError: false,
        defaultValues,
    });

    useEffect(() => {
        if (forhåndsvarselInfo) {
            methods.reset(defaultValues);
        }
    }, [forhåndsvarselInfo, methods, getForhåndsvarselStatus, defaultValues]);

    useLayoutEffect(() => {
        updateParentBounds(containerRef, setParentBounds);
        window.addEventListener('resize', () => updateParentBounds(containerRef, setParentBounds));

        return (): void =>
            window.removeEventListener('resize', () =>
                updateParentBounds(containerRef, setParentBounds)
            );
    }, []);

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty: harEndringer },
    } = methods;

    const skalSendesForhåndsvarsel = useWatch({
        control: methods.control,
        name: 'skalSendesForhåndsvarsel',
    });

    const harBrukerUttaltSeg = useWatch({
        control: methods.control,
        name: 'harBrukerUttaltSeg',
    });

    const handleNesteKnapp = (): void => {
        if (
            varselErSendt &&
            (harBrukerUttaltSeg === HarBrukerUttaltSeg.Ja ||
                harBrukerUttaltSeg === HarBrukerUttaltSeg.Nei)
        ) {
            handleSubmit(sendBrukeruttalelse)();
        } else if (harBrukerUttaltSeg === HarBrukerUttaltSeg.UtsettFrist) {
            handleSubmit(sendUtsettUttalelseFrist)();
        } else if (!varselErSendt && harEndringer) {
            handleSubmit(sendForhåndsvarsel)();
        } else {
            gåTilNeste();
        }
    };

    const getNesteKnappTekst = (): string => {
        if (harBrukerUttaltSeg === HarBrukerUttaltSeg.UtsettFrist) {
            return 'Utsett frist';
        } else if (!varselErSendt && harEndringer) {
            return 'Send forhåndsvarsel';
        }
        return 'Neste';
    };

    return (
        <>
            <VStack gap="4">
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
                    <RadioGroup
                        {...register('skalSendesForhåndsvarsel', {
                            required: 'Velg ett av alternativene over for å gå videre',
                        })}
                        size="small"
                        name="skalSendesForhåndsvarsel"
                        onChange={value => methods.setValue('skalSendesForhåndsvarsel', value)}
                        value={skalSendesForhåndsvarsel}
                        legend="Skal det sendes forhåndsvarsel om tilbakekreving?"
                        description="Brukeren skal som klar hovedregel varsles før vedtak om tilbakekreving
                fattes, slik at de får mulighet til å uttale seg."
                        readOnly={varselErSendt}
                        error={errors.skalSendesForhåndsvarsel?.message}
                    >
                        <Radio value={SkalSendesForhåndsvarsel.Ja}>Ja</Radio>
                        <Radio value={SkalSendesForhåndsvarsel.Nei}>Nei</Radio>
                    </RadioGroup>
                </VStack>

                {skalSendesForhåndsvarsel === SkalSendesForhåndsvarsel.Ja && varselbrevtekster && (
                    <ForhåndsvarselSkjema
                        behandling={behandling}
                        fagsak={fagsak}
                        methods={methods}
                        varselbrevtekster={varselbrevtekster}
                        varselErSendt={varselErSendt}
                        parentBounds={parentBounds}
                    />
                )}
                {skalSendesForhåndsvarsel === SkalSendesForhåndsvarsel.Nei && (
                    <Unntak methods={methods} />
                )}
                {visForhåndsvarselSendt && (
                    <FixedAlert
                        aria-live="polite"
                        variant="success"
                        closeButton
                        width={parentBounds.width}
                        onClose={() => setVisForhåndsvarselSendt(false)}
                    >
                        <Heading spacing size="small" level="3">
                            Forhåndsvarsel er sendt
                        </Heading>
                        Du kan fortsette saksbehandlingen når bruker har uttalt seg, eller når
                        fristen for å uttale seg (3 uker) har gått ut.
                    </FixedAlert>
                )}
            </VStack>
            <ActionBar
                stegtekst={actionBarStegtekst(Behandlingssteg.Forhåndsvarsel)}
                nesteTekst={getNesteKnappTekst()}
                isLoading={
                    sendForhåndsvarselMutation.isPending || sendBrukeruttalelseMutation.isPending
                }
                forrigeAriaLabel={undefined}
                nesteAriaLabel={getNesteKnappTekst()}
                onNeste={handleNesteKnapp}
                onForrige={undefined}
            />
            {sendForhåndsvarselMutation.isError && (
                <FeilModal
                    feil={sendForhåndsvarselMutation.error}
                    lukkFeilModal={sendForhåndsvarselMutation.reset}
                    behandlingId={behandling.behandlingId}
                    fagsakId={fagsak.eksternFagsakId}
                />
            )}
            {sendBrukeruttalelseMutation.isError && (
                <FeilModal
                    feil={sendBrukeruttalelseMutation.error}
                    lukkFeilModal={sendBrukeruttalelseMutation.reset}
                    behandlingId={behandling.behandlingId}
                    fagsakId={fagsak.eksternFagsakId}
                />
            )}
        </>
    );
};
