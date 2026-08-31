import type { JSX } from 'react';

import { CheckmarkCircleIcon, DocPencilIcon } from '@navikt/aksel-icons';
import { Tag } from '@navikt/ds-react';

export const StatusTag = (ferdigvurdert: boolean): JSX.Element =>
    ferdigvurdert ? (
        <Tag
            variant="moderate"
            data-color="success"
            icon={<CheckmarkCircleIcon aria-hidden />}
            className="w-fit ml-auto ax-xl:order-3 gap-2"
        >
            Vurdert
        </Tag>
    ) : (
        <Tag
            variant="moderate"
            data-color="info"
            icon={<DocPencilIcon aria-hidden />}
            className="w-fit ml-auto ax-xl:order-3 gap-2"
        >
            Under vurdering
        </Tag>
    );
