import * as React from 'react';

import styled from 'styled-components';

import navFarger from 'nav-frontend-core';
import Lenke from 'nav-frontend-lenker';

import { ExternalLink } from '@navikt/ds-icons';
import { type IDokumentInfo, type IJournalpost, Journalposttype } from '@navikt/familie-typer';

import HentDokument from './HentDokument';

const Dokument = styled.span`
    display: block;
`;

interface IProps {
    journalpost: IJournalpost;
    dokument: IDokumentInfo;
}

const Dokumentvisning: React.FC<IProps> = ({ journalpost, dokument }) => {
    const [visDokument, settVisDokument] = React.useState<boolean>(false);

    return (
        <Dokument>
            {journalpost.journalposttype === Journalposttype.N ? (
                <span>{dokument.tittel}</span>
            ) : (
                <>
                    <Lenke
                        href="#"
                        onClick={e => {
                            e.preventDefault();
                            settVisDokument(true);
                        }}
                    >
                        <span>{dokument.tittel}</span>
                        <ExternalLink
                            color={navFarger.navBla}
                            aria-label={`Åpne ${dokument.tittel}`}
                        />
                    </Lenke>
                    {visDokument && (
                        <HentDokument
                            journalpost={journalpost}
                            dokument={dokument}
                            onClose={() => {
                                settVisDokument(false);
                            }}
                        />
                    )}
                </>
            )}
        </Dokument>
    );
};

export default Dokumentvisning;
