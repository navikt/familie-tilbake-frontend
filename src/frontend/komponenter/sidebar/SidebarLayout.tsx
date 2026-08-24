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

export const SidebarLayout: FC<Props> = ({ veksleknapp }: Props) => {
    const { tilgjengeligeSider, aktivSide } = useMenysider();
    const settValgtSide = useSidebarStore(state => state.settValgtSide);

    return (
        // biome-ignore lint/a11y/useAriaPropsSupportedByRole: TODO a11y – aria-label på element uten rolle, ikke flagget av tidligere ESLint-oppsett
        <div
            className="border border-ax-border-brand-blue-subtle rounded-2xl bg-ax-bg-default h-full flex flex-col min-h-0 p-4 gap-4"
            aria-label="Oversikt og handlinger over detaljer, historikk, dokumenter, sending av brev og fatte vedtak."
        >
            <div className="flex flex-row items-start gap-2">
                <ToggleGroup
                    data-color="neutral"
                    value={aktivSide}
                    onChange={(value: string): void => {
                        sporHendelse(Hendelser.TOGGLEGROUP_VALGT, {
                            valgtVerdi: value,
                            kontekst: Sporingskontekst.Sidebar,
                            komponentId: 'sidebar-layout',
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
            <SidebarInnhold valgtMenyside={aktivSide} />
        </div>
    );
};
