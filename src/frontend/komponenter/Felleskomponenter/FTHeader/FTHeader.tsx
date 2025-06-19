import type { ISaksbehandler } from '../../../typer/saksbehandler';

import { ExternalLinkIcon, LeaveIcon, MenuGridIcon } from '@navikt/aksel-icons';
import { Dropdown, InternalHeader, Spacer } from '@navikt/ds-react';
import { useQuery } from '@tanstack/react-query';
import * as React from 'react';
import { useMemo } from 'react';
import styled from 'styled-components';

import { hentAInntektUrl, hentBrukerlenkeBaseUrl } from '../../../api/brukerlenker';
import { useHttp } from '../../../api/http/HttpProvider';
import { useFagsakStore } from '../../../store/fagsak';

const RainbowHeader = styled(InternalHeader)`
    .navds-stack__spacer {
        background: linear-gradient(
            to bottom,
            #ff0000 0%,
            #ff0000 14.28%,
            #ff7f00 14.28%,
            #ff7f00 28.56%,
            #ffff00 28.56%,
            #ffff00 42.84%,
            #00ff00 42.84%,
            #00ff00 57.12%,
            #0000ff 57.12%,
            #0000ff 71.4%,
            #4b0082 71.4%,
            #4b0082 85.68%,
            #9400d3 85.68%,
            #9400d3 100%
        );
    }
`;

interface Props {
    innloggetSaksbehandler?: ISaksbehandler;
}

export const FTHeader: React.FC<Props> = ({ innloggetSaksbehandler }) => {
    const { data: brukerlenker } = useQuery({
        queryKey: ['hentBrukerlenkeBaseUrl'],
        queryFn: hentBrukerlenkeBaseUrl,
    });
    const { aInntektUrl: reserveAInntektUrl, modiaBaseUrl, gosysBaseUrl } = brukerlenker || {};
    const personIdent = useFagsakStore(state => state.personIdent);
    const fagsakId = useFagsakStore(state => state.fagsakId);
    const behandlingId = useFagsakStore(state => state.behandlingId);

    const { request } = useHttp();
    const { data: personligAInntektUrl } = useQuery({
        queryKey: ['hentAInntektUrl', personIdent],
        queryFn: () => hentAInntektUrl(request, personIdent, fagsakId, behandlingId),
        retry: 1,
    });

    const aInntektUrl = useMemo(
        () => (personligAInntektUrl ? personligAInntektUrl : reserveAInntektUrl),
        [personligAInntektUrl, reserveAInntektUrl]
    );

    const gosysUrl = useMemo(
        () =>
            gosysBaseUrl && personIdent
                ? `${gosysBaseUrl}/personoversikt/fnr=${personIdent}`
                : gosysBaseUrl,
        [gosysBaseUrl, personIdent]
    );
    const modiaUrl = useMemo(
        () =>
            modiaBaseUrl && personIdent ? `${modiaBaseUrl}/person/${personIdent}` : modiaBaseUrl,
        [modiaBaseUrl, personIdent]
    );
    const harGyldigLenke = useMemo(
        () => !!gosysUrl || !!modiaUrl || !!aInntektUrl,
        [gosysUrl, modiaUrl, aInntektUrl]
    );

    return (
        <RainbowHeader>
            <InternalHeader.Title href="/">Nav - Tilbakekreving</InternalHeader.Title>

            <Spacer />

            {harGyldigLenke && (
                <Dropdown>
                    <InternalHeader.Button as={Dropdown.Toggle}>
                        <MenuGridIcon
                            style={{ fontSize: '1.5rem' }}
                            title="Systemer og oppslagsverk"
                        />
                    </InternalHeader.Button>
                    <Dropdown.Menu>
                        <Dropdown.Menu.GroupedList>
                            <Dropdown.Menu.GroupedList.Heading>
                                Systemer og oppslagsverk
                            </Dropdown.Menu.GroupedList.Heading>
                            {aInntektUrl && (
                                <Dropdown.Menu.GroupedList.Item
                                    as="a"
                                    target="_blank"
                                    href={aInntektUrl}
                                >
                                    {personligAInntektUrl
                                        ? 'A-inntekt personoversikt'
                                        : 'A-inntekt'}
                                    <ExternalLinkIcon aria-hidden />
                                </Dropdown.Menu.GroupedList.Item>
                            )}
                            {gosysUrl && (
                                <Dropdown.Menu.GroupedList.Item
                                    as="a"
                                    target="_blank"
                                    href={gosysUrl}
                                >
                                    {personIdent ? 'Gosys personoversikt' : 'Gosys'}
                                    <ExternalLinkIcon aria-hidden />
                                </Dropdown.Menu.GroupedList.Item>
                            )}
                            {modiaUrl && (
                                <Dropdown.Menu.GroupedList.Item
                                    as="a"
                                    target="_blank"
                                    href={modiaUrl}
                                >
                                    {personIdent ? 'Modia personoversikt' : 'Modia'}
                                    <ExternalLinkIcon aria-hidden />
                                </Dropdown.Menu.GroupedList.Item>
                            )}
                        </Dropdown.Menu.GroupedList>
                    </Dropdown.Menu>
                </Dropdown>
            )}

            <Dropdown>
                <InternalHeader.UserButton
                    as={Dropdown.Toggle}
                    name={innloggetSaksbehandler?.displayName || 'Ukjent'}
                    description={innloggetSaksbehandler?.enhet || 'Ukjent enhet'}
                />
                <Dropdown.Menu>
                    <Dropdown.Menu.List>
                        <Dropdown.Menu.List.Item as="a" href={`${window.origin}/oauth2/logout`}>
                            Logg ut
                            <Spacer />
                            <LeaveIcon aria-hidden fontSize="1.5rem" />
                        </Dropdown.Menu.List.Item>
                    </Dropdown.Menu.List>
                </Dropdown.Menu>
            </Dropdown>
        </RainbowHeader>
    );
};
