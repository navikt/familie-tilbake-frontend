import * as React from 'react';

import styled from 'styled-components';

import { BodyShort, Heading } from '@navikt/ds-react';
import {
    NavdsGlobalColorGray100,
    NavdsGlobalColorGray400,
    NavdsSpacing2,
    NavdsSpacing8,
} from '@navikt/ds-tokens/dist/tokens';

import { ytelsetype } from '../../../../kodeverk';
import {
    IBehandling,
    behandlingsstatuser,
    behandlingsresultater,
    Behandlingstype,
    behandlingårsaker,
} from '../../../../typer/behandling';
import { IFagsak } from '../../../../typer/fagsak';
import { formatterDatostring } from '../../../../utils';
import Informasjonsbolk from '../../../Felleskomponenter/Informasjonsbolk/Informasjonsbolk';

const Container = styled.div`
    border: 1px solid ${NavdsGlobalColorGray400};
    border-left: 0.5rem solid ${NavdsGlobalColorGray400};
    border-radius: 0.25rem;
    padding: ${NavdsSpacing2};
    margin: ${NavdsSpacing2};
    margin-bottom: ${NavdsSpacing8};
`;

const StyledHr = styled.hr`
    border: none;
    border-bottom: 1px solid ${NavdsGlobalColorGray100};
`;

interface IProps {
    fagsak: IFagsak;
    behandling: IBehandling;
}

const Behandlingskort: React.FC<IProps> = ({ fagsak, behandling }) => {
    const tittel =
        behandling.type === Behandlingstype.REVURDERING_TILBAKEKREVING
            ? 'Revurdering tilbakekreving'
            : 'Tilbakekreving';
    return (
        <Container>
            <Heading size="xsmall" level="2">
                {tittel}
            </Heading>
            <BodyShort>{ytelsetype[fagsak.ytelsestype]}</BodyShort>
            <StyledHr />
            {behandling.type === Behandlingstype.REVURDERING_TILBAKEKREVING && (
                <Informasjonsbolk
                    informasjon={[
                        {
                            label: 'Behandlingsårsak',
                            // @ts-ignore
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
                        tekstTitle: 'Test',
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
