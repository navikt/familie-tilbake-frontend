import { useFagsak } from '@context/FagsakContext';
import { HStack, Label, Tag } from '@navikt/ds-react';
import { målform } from '@typer/målform';
import * as React from 'react';

type Props = {
    label: string;
};

const LabelMedSpråk: React.FC<Props> = ({ label }) => {
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
