import type { SkalSendesForhåndsvarsel } from './Forhåndsvarsel';
import type { BehandlingDto } from '../../../generated';
import type { UseFormReturn } from 'react-hook-form';

import { FilePdfIcon } from '@navikt/aksel-icons';
import {
    BodyLong,
    Button,
    ExpansionCard,
    Heading,
    HStack,
    Textarea,
    VStack,
} from '@navikt/ds-react';
import { ATextWidthMax } from '@navikt/ds-tokens/dist/tokens';
import React, { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';

import { useDokumentApi } from '../../../api/dokument';
import { useHttp } from '../../../api/http/HttpProvider';
import { DokumentMal } from '../../../kodeverk';
import { type Ressurs, byggDataRessurs } from '../../../typer/ressurs';

type Props = {
    behandling: BehandlingDto;
    methods: UseFormReturn<{
        skalSendesForhåndsvarsel: SkalSendesForhåndsvarsel;
        fritekst: string;
    }>;
};

export const ForhåndsvarselSkjema: React.FC<Props> = ({ behandling, methods }) => {
    const tittel = behandling.varselSendt ? 'Forhåndsvarsel' : 'Opprett forhåndsvarsel';
    const maksAntallTegn = 4000;
    const [expansionCardÅpen, setExpansionCardÅpen] = useState(!behandling.varselSendt);
    const [varselbrevtekster, setVarselbrevtekster] = useState<Ressurs<any> | null>(null);
    const { forhåndsvisBrev } = useDokumentApi();

    const varselBrevApiPrefix = '/familie-tilbake/api/varselbrevtekst';
    const { request } = useHttp();

    const hentVarselbrevTekst = (): Promise<Ressurs<any>> => {
        const url = `${varselBrevApiPrefix}/${behandling.behandlingId}`;
        console.log('🔗 Kaller API med URL:', url);
        return request<void, any>({
            method: 'GET',
            url: url,
        });
    };

    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            try {
                const respons = await hentVarselbrevTekst();

                if (respons.status === 'SUKSESS') {
                    setVarselbrevtekster(respons);
                } else {
                    console.error('', {
                        status: respons.status,
                        feilmelding: (respons as any).frontendFeilmelding,
                        httpStatus: (respons as any).httpStatusCode,
                    });

                    const mockData = byggDataRessurs({
                        overskrift: 'Nav vurderer om du må betale tilbake overgangsstønad',
                        avsnitter: [
                            {
                                title: '',
                                body: 'Du har fått 42 000 kroner for mye utbetalt i overgangsstønad fra og med 1. januar 2024 til og med 28. februar 2025. Dette er før skatt. Før vi avgjør om du skal betale tilbake, kan du uttale deg innen 19. september 2025. Hvis du må betale tilbake, reduserer vi beløpet med trukket skatt',
                            },
                            {
                                title: 'Dette har skjedd',
                                body: 'Overgangsstønaden din ble endret 5. september 2025, og endringen har ført til at du har fått utbetalt for mye.',
                            },
                            {
                                title: 'Hva kan du gjøre',
                                body: 'Du kan uttale deg om saken ved å sende inn dokumentasjon eller skriftlig forklaring. Vi vil vurdere ditt svar før vi tar en endelig beslutning.',
                            },
                        ],
                    });
                    setVarselbrevtekster(mockData);
                }
            } catch (error) {
                console.error('💥 Network/parsing feil ved henting av varselbrevtekst:', error);
            }
        };

        fetchData();
    }, [behandling.behandlingId]);

    const {
        control,
        formState: { errors },
    } = methods;

    const seForhåndsvisning = (): void => {
        forhåndsvisBrev({
            behandlingId: behandling.behandlingId,
            brevmalkode: DokumentMal.Varsel,
            fritekst: methods.getValues('fritekst'),
        });
    };

    return (
        <HStack gap="4">
            <ExpansionCard
                className="flex-1"
                aria-label={tittel}
                open={expansionCardÅpen}
                onToggle={setExpansionCardÅpen}
            >
                <ExpansionCard.Header>
                    <HStack>
                        <ExpansionCard.Title size="small">{tittel}</ExpansionCard.Title>
                    </HStack>
                </ExpansionCard.Header>
                <ExpansionCard.Content>
                    <HStack align="center" justify="space-between">
                        <Heading size="medium" level="2" spacing>
                            {varselbrevtekster?.status === 'SUKSESS'
                                ? varselbrevtekster.data.overskrift
                                : 'Nav vurderer om du må betale tilbake overgangsstønad'}
                        </Heading>
                        <Button
                            icon={<FilePdfIcon aria-hidden />}
                            variant="tertiary"
                            onClick={seForhåndsvisning}
                        >
                            Forhåndsvisning
                        </Button>
                    </HStack>
                    <VStack maxWidth={ATextWidthMax}>
                        {varselbrevtekster?.status === 'SUKSESS' &&
                            varselbrevtekster.data.avsnitter?.map((avsnitt: any, index: number) => (
                                <div key={`avsnitt-${avsnitt.title || index}`}>
                                    {avsnitt.title && (
                                        <Heading size="xsmall" level="3" spacing>
                                            {avsnitt.title}
                                        </Heading>
                                    )}
                                    <BodyLong size="small" spacing>
                                        {avsnitt.body}
                                    </BodyLong>
                                </div>
                            ))}
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
                                        error={errors.fritekst?.message?.toString()}
                                    />
                                )}
                            />
                        </form>
                        ...
                    </VStack>
                </ExpansionCard.Content>
            </ExpansionCard>
            {!expansionCardÅpen && (
                <Button
                    icon={<FilePdfIcon aria-hidden />}
                    variant="tertiary"
                    onClick={seForhåndsvisning}
                >
                    Forhåndsvisning
                </Button>
            )}
        </HStack>
    );
};
