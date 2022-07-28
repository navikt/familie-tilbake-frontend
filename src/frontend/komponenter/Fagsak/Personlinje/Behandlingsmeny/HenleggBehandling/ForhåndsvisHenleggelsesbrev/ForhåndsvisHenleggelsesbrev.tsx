import * as React from 'react';

import styled from 'styled-components';

import { ExternalLink } from '@navikt/ds-icons';
import { Detail, Link } from '@navikt/ds-react';
import { type ISkjema } from '@navikt/familie-skjema';

import { IBehandling } from '../../../../../../typer/behandling';
import PdfVisningModal from '../../../../../Felleskomponenter/PdfVisningModal/PdfVisningModal';
import { HenleggelseSkjemaDefinisjon } from '../HenleggBehandlingModal/HenleggBehandlingModalContext';
import { useForhåndsvisHenleggelsesbrev } from './useForhåndsvisHenleggelsesbrev';

const StyledContainer = styled.div`
    margin-top: -5px;
    margin-right: auto;
`;

interface IProps {
    behandling: IBehandling;
    skjema: ISkjema<HenleggelseSkjemaDefinisjon, string>;
    kanForhåndsvise: boolean;
}

const ForhåndsvisHenleggelsesBrev: React.FC<IProps> = ({ behandling, skjema, kanForhåndsvise }) => {
    const {
        hentetForhåndsvisning,
        hentBrev,
        visModal,
        settVisModal,
        nullstillHentetForhåndsvisning,
    } = useForhåndsvisHenleggelsesbrev({ skjema });

    React.useEffect(() => {
        if (visModal) {
            hentBrev(behandling);
        }
    }, [visModal]);

    return kanForhåndsvise ? (
        <StyledContainer>
            <Detail size="small">Informer søker: </Detail>
            <Link
                href="#"
                onMouseDown={e => e.preventDefault()}
                onClick={e => {
                    e.preventDefault();
                    settVisModal(true);
                }}
            >
                Forhåndsvis brev
                <ExternalLink />
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
