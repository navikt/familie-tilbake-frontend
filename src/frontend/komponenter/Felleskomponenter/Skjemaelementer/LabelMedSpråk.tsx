import { HStack, Label, Tag } from '@navikt/ds-react';
import * as React from 'react';

type Props = {
    label: string;
    språk: string;
};

const LabelMedSpråk: React.FC<Props> = ({ label, språk }) => {
    return (
        <HStack gap="space-8" align="center">
            <Label>{label}</Label>
            <Tag data-color="info" size="small">
                {språk}
            </Tag>
        </HStack>
    );
};

export { LabelMedSpråk };
