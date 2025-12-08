import type { ForhåndsvarselFormData } from './validering';
import type { BehandlingDto, FagsakDto } from '../../../generated';

import { zodResolver } from '@hookform/resolvers/zod';
import { MegaphoneIcon } from '@navikt/aksel-icons';
import { Alert, Heading, HStack, Radio, RadioGroup, Tag, Tooltip, VStack } from '@navikt/ds-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { differenceInWeeks } from 'date-fns/differenceInWeeks';
import React, { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { JaSkjema } from './JaSkjema';
import { NeiSkjema } from './NeiSkjema';
import { forhåndsvarselSchema, SkalSendesForhåndsvarsel } from './validering';
import { useBehandling } from '../../../context/BehandlingContext';
import {
    BrevmalkodeEnum,
    hentForhåndsvarselinfo,
    hentForhåndsvarselTekst,
} from '../../../generated';
import { bestillBrevMutation } from '../../../generated/@tanstack/react-query.gen';
import { Behandlingssteg } from '../../../typer/behandling';
import { formatterDatostring, formatterRelativTid } from '../../../utils';
import { SYNLIGE_STEG } from '../../../utils/sider';
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
    const navigate = useNavigate();
    const [visForhåndsvarselSendt, setVisForhåndsvarselSendt] = useState(false);
    const queryClient = useQueryClient();

    const { actionBarStegtekst } = useBehandling();

    const { data: forhåndsvarselInfo } = useQuery({
        queryKey: ['hentForhåndsvarselInfo', behandling.behandlingId],
        queryFn: () =>
            hentForhåndsvarselinfo({
                path: {
                    behandlingId: behandling.behandlingId,
                },
            }),
        enabled: !!behandling.behandlingId,
        select: data => {
            const info = data.data?.data;
            return {
                varselbrevSendtTid: info?.varselbrevDto?.varselbrevSendtTid,
                uttalelsesfrist: info?.varselbrevDto?.uttalelsesfrist,
                brukeruttalelse: info?.brukeruttalelse,
            };
        },
    });

    const methods = useForm<ForhåndsvarselFormData>({
        resolver: zodResolver(forhåndsvarselSchema),
        mode: 'all',
        shouldFocusError: false,
        defaultValues: {
            skalSendesForhåndsvarsel: behandling.varselSendt
                ? SkalSendesForhåndsvarsel.Ja
                : SkalSendesForhåndsvarsel.IkkeValgt,
        },
    });

    const {
        handleSubmit,
        formState: { isDirty },
    } = methods;

    const skalSendesForhåndsvarsel = useWatch({
        control: methods.control,
        name: 'skalSendesForhåndsvarsel',
    });

    const { data: varselbrevtekster } = useQuery({
        queryKey: ['hentForhåndsvarselTekst', behandling.behandlingId],
        queryFn: () =>
            hentForhåndsvarselTekst({
                path: {
                    behandlingId: behandling.behandlingId,
                },
            }),
        enabled: !!behandling.behandlingId,
        select: data => data.data?.data,
    });

    const sendForhåndsvarselMutation = useMutation({
        ...bestillBrevMutation(),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['hentBehandling', behandling.behandlingId],
            });
            setVisForhåndsvarselSendt(true);
        },
    });

    const sendForhåndsvarsel = (data: ForhåndsvarselFormData): void => {
        sendForhåndsvarselMutation.mutate({
            body: {
                behandlingId: behandling.behandlingId,
                brevmalkode: BrevmalkodeEnum.VARSEL,
                fritekst: 'fritekst' in data ? data.fritekst : '',
            },
        });
    };

    const skalSendeForhåndsvarsel = isDirty || !behandling.varselSendt;
    const gåTilNeste = (): void => {
        navigate(
            `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}/${SYNLIGE_STEG.FORELDELSE.href}`
        );
    };
    const håndterSubmit = (data: ForhåndsvarselFormData): void => {
        if (skalSendeForhåndsvarsel) {
            sendForhåndsvarsel(data);
            return;
        }
        gåTilNeste();
    };

    return (
        <>
            <VStack as="form" gap="6" onSubmit={handleSubmit(håndterSubmit)}>
                <HStack align="center" justify="space-between">
                    <Heading size="medium">Forhåndsvarsel</Heading>
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

                <Controller
                    control={methods.control}
                    name="skalSendesForhåndsvarsel"
                    render={({ field, fieldState }) => (
                        <RadioGroup
                            {...field}
                            className="max-w-xl"
                            readOnly={behandling.varselSendt}
                            size="small"
                            legend="Skal det sendes forhåndsvarsel om tilbakekreving?"
                            description="Brukeren skal som klar hovedregel varsles før vedtak om tilbakekreving
                        fattes, slik at de får mulighet til å uttale seg."
                            error={fieldState.error?.message}
                        >
                            <Radio value={SkalSendesForhåndsvarsel.Ja}>Ja</Radio>
                            <Radio value={SkalSendesForhåndsvarsel.Nei}>Nei</Radio>
                        </RadioGroup>
                    )}
                />

                {skalSendesForhåndsvarsel === SkalSendesForhåndsvarsel.Ja && varselbrevtekster && (
                    <JaSkjema
                        behandling={behandling}
                        methods={methods}
                        varselbrevtekster={varselbrevtekster}
                    />
                )}

                {skalSendesForhåndsvarsel === SkalSendesForhåndsvarsel.Nei && (
                    <NeiSkjema methods={methods} />
                )}

                {visForhåndsvarselSendt && (
                    <Alert
                        variant="success"
                        contentMaxWidth={false}
                        onClose={() => setVisForhåndsvarselSendt(false)}
                        closeButton
                    >
                        <Heading spacing size="small" level="3">
                            Forhåndsvarsel er sendt
                        </Heading>
                        Du kan fortsette saksbehandlingen når bruker har uttalt seg, eller når
                        fristen for å uttale seg (3 uker) har gått ut.
                    </Alert>
                )}

                <ActionBar
                    stegtekst={actionBarStegtekst(Behandlingssteg.Forhåndsvarsel)}
                    nesteTekst={skalSendeForhåndsvarsel ? 'Send forhåndsvarsel' : 'Neste'}
                    forrigeAriaLabel={undefined}
                    nesteAriaLabel={
                        skalSendeForhåndsvarsel ? 'Send forhåndsvarsel' : 'Gå til foreldelsessteget'
                    }
                    onForrige={undefined}
                    onNeste={behandling.varselSendt ? gåTilNeste : undefined}
                    type={behandling.varselSendt ? 'button' : 'submit'}
                />
            </VStack>

            {sendForhåndsvarselMutation.isError && (
                <FeilModal
                    feil={sendForhåndsvarselMutation.error}
                    lukkFeilModal={sendForhåndsvarselMutation.reset}
                    behandlingId={behandling.behandlingId}
                    fagsakId={fagsak.eksternFagsakId}
                />
            )}
        </>
    );
};
