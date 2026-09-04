import type { FC } from 'react';

import { SidebarLeftIcon, SidebarRightIcon } from '@navikt/aksel-icons';
import { Button } from '@navikt/ds-react';

import { Hendelser, Sporingskontekst, sporHendelse } from '@/utils/sporing';

import { useSidebarVisning } from './useSidebarVisning';

export const SIDEBAR_PANEL_ID = 'informasjonspanel';

export const SidebarVeksleknapp: FC = () => {
    const { innholdErSynlig, veksle } = useSidebarVisning();

    const tekst = innholdErSynlig ? 'Lukk informasjonspanelet' : 'Åpne informasjonspanelet';

    const håndterKlikk = (): void => {
        sporHendelse(Hendelser.KNAPP_KLIKKET, {
            tekst,
            kontekst: Sporingskontekst.Sidebar,
            komponentId: 'veksle-informasjonspanel',
        });
        veksle();
    };

    return (
        <Button
            data-color="neutral"
            size="small"
            variant="tertiary"
            aria-expanded={innholdErSynlig}
            aria-controls={SIDEBAR_PANEL_ID}
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
