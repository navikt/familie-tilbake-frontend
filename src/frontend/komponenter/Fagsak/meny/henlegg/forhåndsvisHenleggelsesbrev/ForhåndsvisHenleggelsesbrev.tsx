import type { HenleggelseSkjemaDefinisjon } from '../henleggModal/HenleggModalContext';

import { ExternalLinkIcon } from '@navikt/aksel-icons';
import { Detail, Link } from '@navikt/ds-react';
import * as React from 'react';
import { styled } from 'styled-components';

import { useForhåndsvisHenleggelsesbrev } from './useForhåndsvisHenleggelsesbrev';
import { type Skjema } from '../../../../../hooks/skjema';
import PdfVisningModal from '../../../../Felleskomponenter/PdfVisningModal/PdfVisningModal';

const StyledContainer = styled.div`
    margin-top: -5px;
    margin-right: auto;
`;

type Props = {
    skjema: Skjema<HenleggelseSkjemaDefinisjon, string>;
    kanForhåndsvise: boolean;
};

const ForhåndsvisHenleggelsesBrev: React.FC<Props> = ({ skjema, kanForhåndsvise }) => {
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
        <StyledContainer>
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
        </StyledContainer>
    ) : null;
};

export default ForhåndsvisHenleggelsesBrev;
