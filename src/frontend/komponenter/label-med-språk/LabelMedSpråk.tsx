import type { FC } from 'react';

import { HStack, Label, Tag } from '@navikt/ds-react';

import { useFagsak } from '~/context/FagsakContext';
import { målform } from '~/typer/målform';

type Props = {
    label: string;
};

const LabelMedSpråk: FC<Props> = ({ label }) => {
    const { språkkode } = useFagsak();

    return (
        <HStack gap="space-8" align="center">
            <Label>{label}</Label>
            <Tag data-color="info" size="small">
                {målform[språkkode]}
            </Tag>
        </HStack>
    );
};

export { LabelMedSpråk };
