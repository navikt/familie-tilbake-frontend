import type { ISaksbehandler } from '../../../typer/saksbehandler';

import { ExternalLinkIcon, LeaveIcon, MenuGridIcon } from '@navikt/aksel-icons';
import { Dropdown, InternalHeader, Spacer } from '@navikt/ds-react';
import { useQuery } from '@tanstack/react-query';
import * as React from 'react';
import { useMemo } from 'react';

import { useHttp } from '../../../api/http/HttpProvider';
import { hentAInntektUrl, hentSystemUrl } from '../../../api/systemUrl';
import { useFagsakStore } from '../../../store/fagsak';

interface Props {
    innloggetSaksbehandler?: ISaksbehandler;
}

export const FTHeader: React.FC<Props> = ({ innloggetSaksbehandler }) => {
    const { data: systemUrlData } = useQuery({
        queryKey: ['hentSystemUrl'],
        queryFn: hentSystemUrl,
    });
    const { aInntektUrl: reserveAInntektUrl, modiaBaseUrl, gosysBaseUrl } = systemUrlData || {};
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
    console.log('ainntektUrl', aInntektUrl);

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
        <InternalHeader>
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
                                {personIdent ? 'Personoversikt' : 'Systemer og oppslagsverk'}
                            </Dropdown.Menu.GroupedList.Heading>
                            {aInntektUrl && (
                                <Dropdown.Menu.GroupedList.Item
                                    as="a"
                                    target="_blank"
                                    href={aInntektUrl}
                                >
                                    A-inntekt <ExternalLinkIcon aria-hidden />
                                </Dropdown.Menu.GroupedList.Item>
                            )}
                            {gosysUrl && (
                                <Dropdown.Menu.GroupedList.Item
                                    as="a"
                                    target="_blank"
                                    href={gosysUrl}
                                >
                                    Gosys <ExternalLinkIcon aria-hidden />
                                </Dropdown.Menu.GroupedList.Item>
                            )}
                            {modiaUrl && (
                                <Dropdown.Menu.GroupedList.Item
                                    as="a"
                                    target="_blank"
                                    href={modiaUrl}
                                >
                                    Modia <ExternalLinkIcon aria-hidden />
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
        </InternalHeader>
    );
};
