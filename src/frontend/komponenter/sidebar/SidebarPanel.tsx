import type { FC, ReactNode } from 'react';

import { Heading, Tabs } from '@navikt/ds-react';

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
        <Tabs
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
            className="border border-ax-border-brand-blue-subtle rounded-2xl bg-ax-bg-default h-full flex flex-col min-h-0 p-4 gap-4"
        >
            <div className="flex flex-row items-start gap-2">
                <Tabs.List className="grow min-w-0">
                    {tilgjengeligeSider.map(side => {
                        const { tittel, ikon: Ikon } = MENYSIDE_META[side];
                        return (
                            <Tabs.Tab
                                key={side}
                                value={side}
                                aria-label={tittel}
                                icon={<Ikon fontSize="1.25rem" title={tittel} />}
                            />
                        );
                    })}
                </Tabs.List>
                {veksleknapp}
            </div>
            {tilgjengeligeSider.map(side => (
                <Tabs.Panel
                    key={side}
                    value={side}
                    className="flex-1 min-h-0 flex-col gap-4 data-[state=active]:flex"
                >
                    <Heading level="2" size="small">
                        {MENYSIDE_META[side].tittel}
                    </Heading>
                    <div className="flex-1 min-h-0 overflow-y-auto scrollbar-stable">
                        <SidebarInnhold valgtMenyside={side} />
                    </div>
                </Tabs.Panel>
            ))}
        </Tabs>
    );
};
