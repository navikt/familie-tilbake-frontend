import type { FC, ReactNode } from 'react';

import { Heading, ToggleGroup } from '@navikt/ds-react';

import { useSidebarStore } from '@/stores/sidebarStore';
import { Hendelser, Sporingskontekst, sporHendelse } from '@/utils/sporing';

import { MENYSIDE_META, type Menysider } from './menysider';
import { SidebarInnhold } from './SidebarInnhold';
import { useMenysider } from './useMenysider';

type Props = {
    veksleknapp?: ReactNode;
};

export const SidebarPanel: FC<Props> = ({ veksleknapp }: Props) => {
    const { tilgjengeligeSider, aktivSide } = useMenysider();
    const settValgtSide = useSidebarStore(state => state.settValgtSide);

    return (
        <div className="border border-ax-border-brand-blue-subtle rounded-2xl bg-ax-bg-default h-full flex flex-col min-h-0 p-4 gap-4">
            <div className="flex flex-row items-start gap-2">
                <ToggleGroup
                    data-color="neutral"
                    value={aktivSide}
                    onChange={(value: string): void => {
                        sporHendelse(Hendelser.TOGGLEGROUP_VALGT, {
                            valgtVerdi: value,
                            kontekst: Sporingskontekst.Sidebar,
                            komponentId: 'sidebar-panel',
                        });
                        settValgtSide(value as Menysider);
                    }}
                    size="small"
                    fill
                    className="grow min-w-0"
                >
                    {tilgjengeligeSider.map(side => {
                        const { tittel, ikon: Ikon } = MENYSIDE_META[side];
                        return (
                            <ToggleGroup.Item
                                key={side}
                                value={side}
                                icon={<Ikon fontSize="1.25rem" title={tittel} />}
                            />
                        );
                    })}
                </ToggleGroup>
                {veksleknapp}
            </div>
            <Heading level="2" size="small">
                {MENYSIDE_META[aktivSide].tittel}
            </Heading>
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-stable">
                <SidebarInnhold valgtMenyside={aktivSide} />
            </div>
        </div>
    );
};
