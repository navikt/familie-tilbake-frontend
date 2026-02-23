import type { HenleggelseSkjemaDefinisjon } from '~/komponenter/meny/henlegg/henleggModal/HenleggModalContext';

import { ExternalLinkIcon } from '@navikt/aksel-icons';
import { Detail, Link } from '@navikt/ds-react';
import * as React from 'react';

import { type Skjema } from '~/hooks/skjema';
import { PdfVisningModal } from '~/komponenter/pdf-visning-modal/PdfVisningModal';

import { useForhåndsvisHenleggelsesbrev } from './useForhåndsvisHenleggelsesbrev';

type Props = {
    skjema: Skjema<HenleggelseSkjemaDefinisjon, string>;
    kanForhåndsvise: boolean;
};

export const ForhåndsvisHenleggelsesBrev: React.FC<Props> = ({ skjema, kanForhåndsvise }) => {
    const {
        hentetForhåndsvisning,
        hentBrev,
        visModal,
        settVisModal,
        nullstillHentetForhåndsvisning,
    } = useForhåndsvisHenleggelsesbrev({ skjema });

    React.useEffect(() => {
        if (visModal) {
            hentBrev();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visModal]);

    return kanForhåndsvise ? (
        <div className="m-auto">
            <Detail>Informer søker: </Detail>
            <Link
                href="#"
                onMouseDown={e => e.preventDefault()}
                onClick={e => {
                    e.preventDefault();
                    settVisModal(true);
                }}
            >
                Forhåndsvis brev
                <ExternalLinkIcon />
            </Link>
            {visModal && (
                <PdfVisningModal
                    åpen={visModal}
                    pdfdata={hentetForhåndsvisning}
                    onRequestClose={() => {
                        nullstillHentetForhåndsvisning();
                        settVisModal(false);
                    }}
                />
            )}
        </div>
    ) : null;
};
