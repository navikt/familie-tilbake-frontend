import * as React from 'react';

import styled from 'styled-components';

import { Label, Tag } from '@navikt/ds-react';

const LabelFlex = styled.div`
    display: flex;
    justify-content: space-between;

    .label {
        max-width: 80%;
    }

    .språkkode .navds-tag--info {
        padding: 0.16rem var(--navds-spacing-2);
    }
`;

interface IProps {
    label: string;
    språk: string;
}

const LabelMedSpråk: React.FC<IProps> = ({ label, språk }) => {
    return (
        <LabelFlex>
            <div className="label">
                <Label size="small">{label}</Label>
            </div>
            <div className="språkkode">
                <Tag variant="info" size="small">
                    {språk}
                </Tag>
            </div>
        </LabelFlex>
    );
};

export { LabelMedSpråk };
