import type { FC, Ref } from 'react';

import { SidebarLeftIcon, SidebarRightIcon } from '@navikt/aksel-icons';
import { Button } from '@navikt/ds-react';

import { Hendelser, Sporingskontekst, sporHendelse } from '@/utils/sporing';

import { useSidebarVisning } from './useSidebarVisning';

export const SIDEBAR_PANEL_ID = 'informasjonspanel';

type Props = {
    ref?: Ref<HTMLButtonElement>;
    onVeksle?: () => void;
};

export const SidebarVeksleknapp: FC<Props> = ({ ref, onVeksle }: Props) => {
    const { erStorSkjerm, innholdErSynlig, veksle } = useSidebarVisning();

    const tekst = innholdErSynlig ? 'Lukk informasjonspanelet' : 'Åpne informasjonspanelet';

    const håndterKlikk = (): void => {
        sporHendelse(Hendelser.KNAPP_KLIKKET, {
            tekst,
            kontekst: Sporingskontekst.Sidebar,
            komponentId: 'veksle-informasjonspanel',
        });
        veksle();
        onVeksle?.();
    };

    const dialogegenskaper = erStorSkjerm
        ? { 'aria-expanded': innholdErSynlig, 'aria-controls': SIDEBAR_PANEL_ID }
        : { 'aria-haspopup': 'dialog' as const };

    return (
        <Button
            ref={ref}
            data-color="neutral"
            size="small"
            variant="tertiary"
            {...dialogegenskaper}
            icon={
                innholdErSynlig ? (
                    <SidebarRightIcon title={tekst} />
                ) : (
                    <SidebarLeftIcon title={tekst} />
                )
            }
            onClick={håndterKlikk}
        />
    );
};
