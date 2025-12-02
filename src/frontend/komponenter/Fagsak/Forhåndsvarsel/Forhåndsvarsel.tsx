import type { ForhåndsvarselFormData } from './forhåndsvarselSchema';
import type { BehandlingDto, FagsakDto } from '../../../generated';

import { zodResolver } from '@hookform/resolvers/zod';
import { MegaphoneIcon } from '@navikt/aksel-icons';
import { Alert, Heading, HStack, Radio, RadioGroup, Tag, Tooltip, VStack } from '@navikt/ds-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { differenceInWeeks } from 'date-fns/differenceInWeeks';
import React, { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { forhåndsvarselSchema } from './forhåndsvarselSchema';
import { ForhåndsvarselSkjema } from './ForhåndsvarselSkjema';
import { Unntak } from './Unntak';
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

export enum SkalSendesForhåndsvarsel {
    Ja = 'ja',
    Nei = 'nei',
    IkkeValgt = '',
}

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
        reValidateMode: 'onBlur',
        resolver: zodResolver(forhåndsvarselSchema),
        shouldFocusError: false,
    });

    const {
        register,
        handleSubmit,
        formState: { isDirty },
    } = methods;

    const skalSendesForhåndsvarsel = useWatch({
        control: methods.control,
        name: 'skalSendesForhåndsvarsel',
    });

    const gåTilNeste = (): void => {
        navigate(
            `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}/${SYNLIGE_STEG.FORELDELSE.href}`
        );
    };

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

    const sendForhåndsvarsel = handleSubmit(data => {
        sendForhåndsvarselMutation.mutate({
            body: {
                behandlingId: behandling.behandlingId,
                brevmalkode: BrevmalkodeEnum.VARSEL,
                fritekst: 'fritekst' in data ? data.fritekst : '',
            },
        });
    });

    return (
        <>
            <VStack as="form" gap="4">
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

                <RadioGroup
                    {...register('skalSendesForhåndsvarsel')}
                    className="max-w-xl"
                    readOnly={behandling.varselSendt}
                    size="small"
                    name="skalSendesForhåndsvarsel"
                    onChange={value => methods.setValue('skalSendesForhåndsvarsel', value)}
                    value={skalSendesForhåndsvarsel}
                    legend="Skal det sendes forhåndsvarsel om tilbakekreving?"
                    description="Brukeren skal som klar hovedregel varsles før vedtak om tilbakekreving
                fattes, slik at de får mulighet til å uttale seg."
                    error={methods.formState.errors.skalSendesForhåndsvarsel?.message}
                >
                    <Radio value={SkalSendesForhåndsvarsel.Ja}>Ja</Radio>
                    <Radio value={SkalSendesForhåndsvarsel.Nei}>Nei</Radio>
                </RadioGroup>

                {skalSendesForhåndsvarsel === SkalSendesForhåndsvarsel.Ja && varselbrevtekster && (
                    <ForhåndsvarselSkjema
                        behandling={behandling}
                        methods={methods}
                        varselbrevtekster={varselbrevtekster}
                    />
                )}

                {skalSendesForhåndsvarsel === SkalSendesForhåndsvarsel.Nei && (
                    <Unntak methods={methods} />
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
                    nesteTekst={isDirty ? 'Send forhåndsvarsel' : 'Neste'}
                    forrigeAriaLabel={undefined}
                    nesteAriaLabel={isDirty ? 'Send forhåndsvarsel' : 'Gå til foreldelsessteget'}
                    onNeste={behandling.varselSendt ? gåTilNeste : sendForhåndsvarsel}
                    onForrige={undefined}
                    erSubmit
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
