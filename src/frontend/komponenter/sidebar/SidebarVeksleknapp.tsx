import type { FC } from 'react';

import { SidebarLeftIcon, SidebarRightIcon } from '@navikt/aksel-icons';
import { Button } from '@navikt/ds-react';

import { useSidebarStore } from '@/stores/sidebarStore';
import { Hendelser, Sporingskontekst, sporHendelse } from '@/utils/sporing';

export const SIDEBAR_PANEL_ID = 'informasjonspanel';

export const SidebarVeksleknapp: FC = () => {
    const erÅpen = useSidebarStore(state => state.erÅpen);
    const veksleÅpen = useSidebarStore(state => state.veksleÅpen);

    const tekst = erÅpen ? 'Lukk informasjonspanelet' : 'Åpne informasjonspanelet';

    const håndterKlikk = (): void => {
        sporHendelse(Hendelser.KNAPP_KLIKKET, {
            tekst,
            kontekst: Sporingskontekst.Sidebar,
            komponentId: 'veksle-informasjonspanel',
        });
        veksleÅpen();
    };

    return (
        <Button
            type="button"
            size="small"
            variant="tertiary"
            aria-expanded={erÅpen}
            aria-controls={SIDEBAR_PANEL_ID}
            icon={erÅpen ? <SidebarRightIcon title={tekst} /> : <SidebarLeftIcon title={tekst} />}
            onClick={håndterKlikk}
        />
    );
};
