import { Label, Tag } from '@navikt/ds-react';
import { ASpacing2 } from '@navikt/ds-tokens/dist/tokens';
import * as React from 'react';
import { styled } from 'styled-components';

const LabelFlex = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    .label {
        max-width: 80%;
    }

    .språkkode .navds-tag--info {
        padding: 0.16rem ${ASpacing2};
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
                <Tag variant="info" size="small">
                    {språk}
                </Tag>
            </div>
        </LabelFlex>
    );
};

export { LabelMedSpråk };
