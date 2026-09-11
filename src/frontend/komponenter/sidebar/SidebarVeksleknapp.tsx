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
    const { visPanel, veksle } = useSidebarVisning();

    const tekst = visPanel ? 'Lukk informasjonspanelet' : 'Åpne informasjonspanelet';

    const håndterKlikk = (): void => {
        sporHendelse(Hendelser.KNAPP_KLIKKET, {
            tekst,
            kontekst: Sporingskontekst.Sidebar,
            komponentId: 'veksle-informasjonspanel',
        });
        veksle();
        onVeksle?.();
    };

    return (
        <Button
            ref={ref}
            data-color="neutral"
            size="small"
            variant="tertiary"
            aria-expanded={visPanel}
            aria-controls={SIDEBAR_PANEL_ID}
            icon={visPanel ? <SidebarRightIcon title={tekst} /> : <SidebarLeftIcon title={tekst} />}
            onClick={håndterKlikk}
        />
    );
};
