import { Label, Tag } from '@navikt/ds-react';
import * as React from 'react';
import { styled } from 'styled-components';

const LabelFlex = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    .label {
        max-width: 80%;
    }
`;

type Props = {
    label: string;
    språk: string;
};

const LabelMedSpråk: React.FC<Props> = ({ label, språk }) => {
    return (
        <LabelFlex>
            <div className="label">
                <Label size="small">{label}</Label>
            </div>
            <div className="språkkode">
                <Tag data-color="info" size="small">
                    {språk}
                </Tag>
            </div>
        </LabelFlex>
    );
};

export { LabelMedSpråk };
