import type { FC } from 'react';

import { EyeIcon } from '@navikt/aksel-icons';
import { Button } from '@navikt/ds-react';
import { useState } from 'react';

import { PdfVisningModal } from '@/komponenter/pdf-visning-modal/PdfVisningModal';
import { byggDataRessurs } from '@/typer/ressurs';

type Props = {
    varselbrevUrl: string;
    laster?: boolean;
};

export const VisSendtVarselbrev: FC<Props> = ({ varselbrevUrl, laster = false }: Props) => {
    const [visModal, setVisModal] = useState(false);

    return (
        <>
            <Button
                size="small"
                variant="tertiary"
                icon={<EyeIcon aria-hidden />}
                loading={laster}
                onClick={(): void => setVisModal(true)}
            >
                Vis brevet
            </Button>
            <PdfVisningModal
                åpen={visModal}
                pdfdata={byggDataRessurs(varselbrevUrl)}
                onRequestClose={(): void => setVisModal(false)}
            />
        </>
    );
};
