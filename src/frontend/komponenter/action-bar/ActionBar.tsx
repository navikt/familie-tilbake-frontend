import type { FC } from 'react';
import type { ActionBarConfig } from '@/stores/actionBarStore';

import { ChevronLeftIcon, ChevronRightIcon } from '@navikt/aksel-icons';
import { BodyShort, Button, HStack, Tooltip } from '@navikt/ds-react';

import { useBehandling } from '@/context/BehandlingContext';
import { useBehandlingState } from '@/context/BehandlingStateContext';
import { Behandlingsmeny } from '@/komponenter/meny/Meny';
import { KompaktStegflyt } from '@/komponenter/stegflyt/KompaktStegflyt';
import { Hendelser, Sporingskontekst, sporHendelse } from '@/utils/sporing';

export const ActionBar: FC<ActionBarConfig> = ({
    stegtekst = '',
    forrigeAriaLabel,
    nesteAriaLabel,
    onNeste,
    onForrige,
    formId,
    nesteTekst = 'Neste',
    forrigeTekst = 'Forrige',
    isLoading = false,
    skjulNeste = false,
    disableNeste = false,
    type = 'button',
}: ActionBarConfig) => {
    const { erNyModell } = useBehandling();
    const { harKravgrunnlag } = useBehandlingState();

    // Ny modell viser stegflyten inne i action-baren i stedet for meny og stegtekst.
    // Uten kravgrunnlag er behandlingen ikke i gang i noe steg (den venter), og da
    // beholder vi stegteksten som forteller hvilken tilstand behandlingen er i.
    const visStegflyt = erNyModell && harKravgrunnlag;

    return (
        <nav
            className={`flex bg-ax-bg-default px-6 py-3 rounded-2xl border-ax-border-brand-blue-subtle border min-w-96 gap-4 ${erNyModell && !visStegflyt ? 'justify-end' : 'justify-between'}`}
            aria-label={
                visStegflyt ? 'Behandlingens steg og handlinger' : 'Meny og behandlingens steg'
            }
        >
            {!erNyModell && <Behandlingsmeny />}
            {visStegflyt && <KompaktStegflyt />}

            <HStack gap="space-32" wrap={false} className="shrink-0">
                {!visStegflyt && (
                    <BodyShort
                        size="small"
                        className="text-ax-text-neutral-subtle font-ax-bold flex items-center"
                    >
                        {stegtekst}
                    </BodyShort>
                )}
                <HStack gap="space-16" wrap={false}>
                    {forrigeAriaLabel && onForrige ? (
                        <Tooltip content={forrigeAriaLabel} aria-disabled={isLoading}>
                            <Button
                                variant="secondary"
                                icon={<ChevronLeftIcon aria-hidden />}
                                className="flex gap-0 ax-lg:gap-2 py-2"
                                size="small"
                                loading={isLoading}
                                disabled={isLoading}
                                onClick={(): void => {
                                    sporHendelse(Hendelser.KNAPP_KLIKKET, {
                                        tekst: forrigeTekst,
                                        kontekst: Sporingskontekst.ActionBar,
                                        seksjon: stegtekst,
                                    });
                                    onForrige();
                                }}
                                aria-label={forrigeAriaLabel}
                            >
                                <span className="hidden ax-md:block">{forrigeTekst}</span>
                            </Button>
                        </Tooltip>
                    ) : (
                        visStegflyt && (
                            /*
                             * Første steg har ingen forrige-knapp, og uten en plassholder ville
                             * stegflyten fått rundt 110 px mer plass akkurat der. Da rekker
                             * stegnavnene å vises, for så å forsvinne så snart knappen dukker opp
                             * på neste steg. Vi holder derfor bredden lik gjennom hele flyten.
                             */
                            <Button
                                aria-hidden
                                tabIndex={-1}
                                variant="secondary"
                                icon={<ChevronLeftIcon aria-hidden />}
                                className="flex gap-0 ax-lg:gap-2 py-2 invisible"
                                size="small"
                            >
                                <span className="hidden ax-md:block">{forrigeTekst}</span>
                            </Button>
                        )
                    )}
                    {!skjulNeste && (
                        <Tooltip
                            content={nesteAriaLabel ?? nesteTekst}
                            aria-disabled={isLoading || disableNeste}
                        >
                            <Button
                                icon={<ChevronRightIcon aria-hidden />}
                                iconPosition="right"
                                className="flex gap-0 ax-lg:gap-2 py-2"
                                type={type}
                                size="small"
                                form={formId}
                                loading={isLoading}
                                onClick={(): void => {
                                    sporHendelse(Hendelser.KNAPP_KLIKKET, {
                                        tekst: nesteTekst,
                                        kontekst: Sporingskontekst.ActionBar,
                                        seksjon: stegtekst,
                                    });
                                    if (onNeste && type !== 'submit') onNeste();
                                }}
                                aria-label={nesteAriaLabel}
                                disabled={isLoading || disableNeste}
                            >
                                <span className="hidden ax-md:block">{nesteTekst}</span>
                            </Button>
                        </Tooltip>
                    )}
                </HStack>
            </HStack>
        </nav>
    );
};
