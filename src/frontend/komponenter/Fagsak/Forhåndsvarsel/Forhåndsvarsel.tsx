import type { Behandling } from '../../../typer/behandling';
import type { Fagsak } from '../../../typer/fagsak';

import { FileIcon } from '@navikt/aksel-icons';
import {
    BodyLong,
    Button,
    ExpansionCard,
    Heading,
    HStack,
    Radio,
    RadioGroup,
    Textarea,
    VStack,
} from '@navikt/ds-react';
import { ATextWidthMax } from '@navikt/ds-tokens/dist/tokens';
import { QueryClientProvider, useMutation, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { useBehandling } from '../../../context/BehandlingContext';
import {
    bestillBrevMutation,
    forhåndsvisBrevMutation,
} from '../../../generated/@tanstack/react-query.gen';
import { DokumentMal } from '../../../kodeverk';
import { Behandlingssteg } from '../../../typer/behandling';
import { SYNLIGE_STEG } from '../../../utils/sider';
import { ActionBar } from '../ActionBar/ActionBar';

type Props = {
    behandling: Behandling;
    fagsak: Fagsak;
};

enum SkalSendesForhåndsvarsel {
    Ja = 'ja',
    Nei = 'nei',
    Sendt = 'sendt',
}

export const Forhåndsvarsel: React.FC<Props> = ({ behandling, fagsak }) => {
    const navigate = useNavigate();

    const { actionBarStegtekst } = useBehandling();
    const queryClient = useQueryClient();

    const methods = useForm({
        reValidateMode: 'onBlur',
        shouldFocusError: false,
        defaultValues: {
            skalSendesForhåndsvarsel: behandling.varselSendt ? SkalSendesForhåndsvarsel.Ja : '', //TODO: Denne må håndteres annereledes når vi har backend for de andre valgene
            fritekst: '',
        },
    });

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isDirty: harEndringer },
    } = methods;
    const skalSendesForhåndsvarsel = useWatch({
        control: methods.control,
        name: 'skalSendesForhåndsvarsel',
    });

    const maksAntallTegn = 2000;
    const tittel = behandling.varselSendt ? 'Forhåndsvarsel' : 'Opprett forhåndsvarsel';

    const gåTilNeste = (): void => {
        navigate(
            `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}/${SYNLIGE_STEG.FORELDELSE.href}`
        );
    };

    const sendForhåndsvarselMutation = useMutation({
        ...bestillBrevMutation(),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['hentBehandling', behandling.behandlingId],
            });
            // Gå til neste steg etter vellykket sending
            gåTilNeste();
        },
        onError: error => {
            console.error('Feil ved sending av forhåndsvarsel:', error);
            // Håndter feil (toast notification, etc.)
        },
    });

    const sendForhåndsvarsel = handleSubmit(data => {
        sendForhåndsvarselMutation.mutate({
            body: {
                behandlingId: behandling.behandlingId,
                brevmalkode: DokumentMal.Varsel,
                fritekst: data.fritekst,
            },
        });
    });

    const seForhåndsvisningMutation = useMutation({
        ...forhåndsvisBrevMutation(),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['hentBehandling'],
            });
        },
        onError: error => {
            console.error('Feil ved forhåndsvisning av brev:', error);
        },
    });

    const seForhåndsvisning = (): void => {
        seForhåndsvisningMutation.mutate({
            body: {
                behandlingId: behandling.behandlingId,
                brevmalkode: DokumentMal.Varsel,
                fritekst: methods.getValues('fritekst'),
            },
        });
    };

    return (
        <QueryClientProvider client={queryClient}>
            <VStack gap="4">
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
                    <Radio value={SkalSendesForhåndsvarsel.Sendt}>
                        Forhåndsvarsel er allerede sendt
                    </Radio>
                </RadioGroup>
                {skalSendesForhåndsvarsel === SkalSendesForhåndsvarsel.Ja && (
                    <ExpansionCard aria-label={tittel} defaultOpen={!behandling.varselSendt}>
                        <ExpansionCard.Header>
                            <HStack>
                                <ExpansionCard.Title size="small">{tittel}</ExpansionCard.Title>
                            </HStack>
                        </ExpansionCard.Header>
                        <ExpansionCard.Content>
                            <HStack align="center" justify="space-between">
                                <Heading size="medium" level="2" spacing>
                                    Nav vurderer om du må betale tilbake overgangsstønad
                                </Heading>
                                <Button
                                    icon={<FileIcon aria-hidden />}
                                    variant="secondary"
                                    size="small"
                                    onClick={seForhåndsvisning}
                                >
                                    Se forhåndsvisning av brev
                                </Button>
                            </HStack>
                            <VStack maxWidth={ATextWidthMax}>
                                <BodyLong size="small" spacing>
                                    Du har fått 42 000 kroner for mye utbetalt i overgangsstønad fra
                                    og med 1. januar 2024 til og med 28. februar 2025. Dette er før
                                    skatt. Før vi avgjør om du skal betale tilbake, kan du uttale
                                    deg innen 19. september 2025. Hvis du må betale tilbake,
                                    reduserer vi beløpet med trukket skatt
                                </BodyLong>
                                <Heading size="xsmall" level="3" spacing>
                                    Dette har skjedd
                                </Heading>
                                <BodyLong size="small" spacing>
                                    Overgangsstønaden din ble endret 5. september 2025, og endringen
                                    har ført til at du har fått utbetalt for mye.
                                </BodyLong>
                                <form>
                                    <Controller
                                        name="fritekst"
                                        control={control}
                                        rules={{
                                            required: 'Du må legge til en tekst',
                                            maxLength: {
                                                value: maksAntallTegn,
                                                message: `Maks ${maksAntallTegn} tegn`,
                                            },
                                        }}
                                        render={({ field }) => (
                                            <Textarea
                                                {...field}
                                                label="Legg til utdypende tekst"
                                                maxLength={maksAntallTegn}
                                                error={errors.fritekst?.message}
                                            />
                                        )}
                                    />
                                </form>
                                ...
                            </VStack>
                        </ExpansionCard.Content>
                    </ExpansionCard>
                )}
            </VStack>
            <ActionBar
                stegtekst={actionBarStegtekst(Behandlingssteg.Forhåndsvarsel)}
                nesteTekst={harEndringer ? 'Send forhåndsvarsel' : 'Neste'}
                forrigeAriaLabel={undefined}
                nesteAriaLabel={harEndringer ? 'Send forhåndsvarsel' : 'Gå til foreldelsessteget'}
                onNeste={!behandling.varselSendt ? sendForhåndsvarsel : gåTilNeste}
                onForrige={undefined}
            />
        </QueryClientProvider>
    );
};
