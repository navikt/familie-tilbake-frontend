import type { IBehandling } from '../../../../typer/behandling';
import type { IFagsak } from '../../../../typer/fagsak';

import { BodyShort, Heading } from '@navikt/ds-react';
import { AGray100, AGray400, ASpacing2, ASpacing8 } from '@navikt/ds-tokens/dist/tokens';
import * as React from 'react';
import { styled } from 'styled-components';

import { ytelsetype } from '../../../../kodeverk';
import {
    behandlingsstatuser,
    behandlingsresultater,
    Behandlingstype,
    behandlingårsaker,
} from '../../../../typer/behandling';
import { formatterDatostring } from '../../../../utils';
import Informasjonsbolk from '../../../Felleskomponenter/Informasjonsbolk/Informasjonsbolk';

const Container = styled.div`
    border: 1px solid ${AGray400};
    border-left: 0.5rem solid ${AGray400};
    border-radius: 0.25rem;
    padding: ${ASpacing2};
    margin: ${ASpacing2};
    margin-bottom: ${ASpacing8};
`;

const StyledHr = styled.hr`
    border: none;
    border-bottom: 1px solid ${AGray100};
`;

interface IProps {
    fagsak: IFagsak;
    behandling: IBehandling;
}

const Behandlingskort: React.FC<IProps> = ({ fagsak, behandling }) => {
    const tittel =
        behandling.type === Behandlingstype.RevurderingTilbakekreving
            ? 'Revurdering tilbakekreving'
            : 'Tilbakekreving';
    return (
        <Container>
            <Heading size="xsmall" level="2">
                {tittel}
            </Heading>
            <BodyShort>
                {ytelsetype[fagsak.ytelsestype]}
                {fagsak.institusjon ? ' - Institusjon' : null}
            </BodyShort>
            <StyledHr />
            {behandling.type === Behandlingstype.RevurderingTilbakekreving && (
                <Informasjonsbolk
                    informasjon={[
                        {
                            label: 'Behandlingsårsak',
                            // @ts-expect-error har verdi her
                            tekst: behandlingårsaker[behandling.behandlingsårsakstype],
                        },
                    ]}
                />
            )}
            <Informasjonsbolk
                informasjon={[
                    {
                        label: 'Behandlingsstatus',
                        tekst: behandlingsstatuser[behandling.status],
                    },
                    {
                        label: 'Resultat',
                        tekst: behandling.resultatstype
                            ? behandlingsresultater[behandling.resultatstype]
                            : '-',
                    },
                ]}
            />
            <Informasjonsbolk
                informasjon={[
                    {
                        label: 'Opprettet',
                        tekst: behandling.opprettetDato
                            ? formatterDatostring(behandling.opprettetDato)
                            : '-',
                    },
                    {
                        label: 'Avsluttet',
                        tekst: behandling.avsluttetDato
                            ? formatterDatostring(behandling.avsluttetDato)
                            : '-',
                    },
                ]}
            />
            <Informasjonsbolk
                informasjon={[
                    {
                        label: 'Enhet',
                        tekst: behandling.enhetskode ? behandling.enhetskode : '-',
                    },
                ]}
            />
        </Container>
    );
};

export default Behandlingskort;
