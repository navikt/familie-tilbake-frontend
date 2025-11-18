import type { BehandlingDto, FagsakDto } from '../../../generated';

import { Alert, Heading, Radio, RadioGroup, VStack } from '@navikt/ds-react';
import { ATextWidthMax } from '@navikt/ds-tokens/dist/tokens';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { ForhåndsvarselSkjema } from './ForhåndsvarselSkjema';
import { Unntak } from './Unntak';
import { useBehandling } from '../../../context/BehandlingContext';
import { BrevmalkodeEnum, hentForhåndsvarselTekst } from '../../../generated';
import { bestillBrevMutation } from '../../../generated/@tanstack/react-query.gen';
import { Behandlingssteg } from '../../../typer/behandling';
import { SYNLIGE_STEG } from '../../../utils/sider';
import { FeilModal } from '../../Felleskomponenter/Modal/Feil/FeilModal';
import { ActionBar } from '../ActionBar/ActionBar';

type Props = {
    behandling: BehandlingDto;
    fagsak: FagsakDto;
};

export enum SkalSendesForhåndsvarsel {
    //TODO: erstatte med kodeverk fra backend når det er på plass
    Ja = 'ja',
    Nei = 'nei',
    IkkeValgt = '',
}

export const Forhåndsvarsel: React.FC<Props> = ({ behandling, fagsak }) => {
    const navigate = useNavigate();
    const [visForhåndsvarselSendt, setVisForhåndsvarselSendt] = useState(false);
    const queryClient = useQueryClient();

    const { actionBarStegtekst } = useBehandling();

    const getForhåndsvarselStatus = (behandling: BehandlingDto): SkalSendesForhåndsvarsel => {
        if (behandling.varselSendt) {
            return SkalSendesForhåndsvarsel.Ja;
        }
        // TODO: Denne må håndteres annereledes når vi har backend for de andre valgene
        return SkalSendesForhåndsvarsel.IkkeValgt;
    };

    const methods = useForm({
        reValidateMode: 'onBlur',
        shouldFocusError: false,
        defaultValues: {
            skalSendesForhåndsvarsel: getForhåndsvarselStatus(behandling),
            fritekst: '',
        },
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty: harEndringer },
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
                fritekst: data.fritekst,
            },
        });
    });

    return (
        <>
            <VStack gap="4">
                <VStack maxWidth={ATextWidthMax}>
                    <Heading level="1" size="small" spacing>
                        Forhåndsvarsel
                    </Heading>
                    <RadioGroup
                        {...register('skalSendesForhåndsvarsel', {
                            required: 'Velg ett av alternativene over for å gå videre',
                        })}
                        name="skalSendesForhåndsvarsel"
                        onChange={value => methods.setValue('skalSendesForhåndsvarsel', value)}
                        value={skalSendesForhåndsvarsel}
                        legend="Skal det sendes forhåndsvarsel om tilbakekreving?"
                        description="Brukeren skal som klar hovedregel varsles før vedtak om tilbakekreving
                fattes, slik at de får mulighet til å uttale seg."
                        error={errors.skalSendesForhåndsvarsel?.message}
                    >
                        <Radio value={SkalSendesForhåndsvarsel.Ja}>Ja</Radio>
                        <Radio value={SkalSendesForhåndsvarsel.Nei}>Nei</Radio>
                    </RadioGroup>
                </VStack>

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
            </VStack>
            <ActionBar
                stegtekst={actionBarStegtekst(Behandlingssteg.Forhåndsvarsel)}
                nesteTekst={harEndringer ? 'Send forhåndsvarsel' : 'Neste'}
                forrigeAriaLabel={undefined}
                nesteAriaLabel={harEndringer ? 'Send forhåndsvarsel' : 'Gå til foreldelsessteget'}
                onNeste={behandling.varselSendt ? gåTilNeste : sendForhåndsvarsel}
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
        </>
    );
};
