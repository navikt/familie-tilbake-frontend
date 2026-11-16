import type { JSX } from 'react';
import type { ArsakTilTilbakeforing } from '@/generated-new';

import { DocPencilIcon } from '@navikt/aksel-icons';
import { Tag } from '@navikt/ds-react';

type Props = {
    tilbakeført?: ArsakTilTilbakeforing | undefined;
    ferdigvurdert: boolean;
};

export const StatusTag = ({ tilbakeført, ferdigvurdert }: Props): JSX.Element => {
    if (tilbakeført) {
        return (
            <Tag variant="moderate" data-color="warning" className="w-fit gap-2">
                Vurder på nytt
            </Tag>
        );
    }

    return ferdigvurdert ? (
        <Tag variant="moderate" data-color="success" className="w-fit gap-2">
            Vurdert
        </Tag>
    ) : (
        <Tag
            variant="moderate"
            data-color="info"
            icon={<DocPencilIcon aria-hidden />}
            className="w-fit gap-2"
        >
            Under vurdering
        </Tag>
    );
};
