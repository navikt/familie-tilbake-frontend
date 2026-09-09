import type { FC } from 'react';

import { Button } from '@navikt/ds-react';

import { Hendelser, Sporingskontekst, sporHendelse } from '@/utils/sporing';

import { MENYSIDE_META } from './menysider';
import { useMenysider } from './useMenysider';
import { useSidebarVisning } from './useSidebarVisning';

type Props = {
    onÅpnetSide?: () => void;
};

export const SidebarSnarveier: FC<Props> = ({ onÅpnetSide }: Props) => {
    const { tilgjengeligeSider, aktivSide } = useMenysider();
    const { åpneSide } = useSidebarVisning();

    return (
        <nav aria-label="Snarveier i informasjonspanelet" className="flex flex-col gap-4">
            {tilgjengeligeSider.map(side => {
                const { tittel, ikon: Ikon } = MENYSIDE_META[side];
                return (
                    <Button
                        key={side}
                        size="small"
                        variant="tertiary"
                        data-color="neutral"
                        aria-current={side === aktivSide ? 'true' : undefined}
                        aria-label={`Åpne ${tittel.toLocaleLowerCase()}`}
                        icon={<Ikon title={tittel} />}
                        onClick={(): void => {
                            sporHendelse(Hendelser.KNAPP_KLIKKET, {
                                tekst: `Åpne ${tittel.toLocaleLowerCase()}`,
                                kontekst: Sporingskontekst.Sidebar,
                                komponentId: 'sidebar-snarvei',
                            });
                            åpneSide(side);
                            onÅpnetSide?.();
                        }}
                    />
                );
            })}
        </nav>
    );
};
