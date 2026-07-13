import type { ReactElement, ReactNode } from 'react';
import type { Moment } from '@/generated-new';

import { createContext, use } from 'react';

type VilkårsvurderingLesedataContextType = {
    momenterSærligeGrunner: readonly Moment[];
    momenterReduksjonGodTro: readonly Moment[];
    erUnder4xRettsgebyr: boolean;
};

const VilkårsvurderingLesedataContext = createContext<
    VilkårsvurderingLesedataContextType | undefined
>(undefined);

type Props = VilkårsvurderingLesedataContextType & {
    children: ReactNode;
};

export const VilkårsvurderingLesedataProvider = ({
    momenterSærligeGrunner,
    momenterReduksjonGodTro,
    erUnder4xRettsgebyr,
    children,
}: Props): ReactElement => {
    return (
        <VilkårsvurderingLesedataContext
            value={{ momenterSærligeGrunner, momenterReduksjonGodTro, erUnder4xRettsgebyr }}
        >
            {children}
        </VilkårsvurderingLesedataContext>
    );
};

export const useVilkårsvurderingLesedata = (): VilkårsvurderingLesedataContextType => {
    const context = use(VilkårsvurderingLesedataContext);
    if (!context) {
        throw new Error(
            'useVilkårsvurderingLesedata må brukes innenfor VilkårsvurderingLesedataProvider'
        );
    }
    return context;
};
