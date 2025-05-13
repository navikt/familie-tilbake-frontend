import type { ISaksbehandler } from '../../../typer/saksbehandler';

import { ExternalLinkIcon, LeaveIcon, MenuGridIcon } from '@navikt/aksel-icons';
import { Dropdown, InternalHeader, Spacer } from '@navikt/ds-react';
import { useQuery } from '@tanstack/react-query';
import * as React from 'react';
import { useMemo } from 'react';

import { hentSystemUrl } from '../../../api/systemUrl';
import { usePersonIdentStore } from '../../../store/personIdent';

interface IHeaderProps {
    innloggetSaksbehandler?: ISaksbehandler;
}

const FTHeader: React.FC<IHeaderProps> = ({ innloggetSaksbehandler }) => {
    const query = useQuery({ queryKey: ['system-url'], queryFn: hentSystemUrl });
    const personIdent = usePersonIdentStore(state => state.personIdent);
    const aInntektUrl = useMemo(
        () => `${query.data?.aInntektBaseUrl}/${personIdent}`,
        [personIdent, query.data?.aInntektBaseUrl]
    );
    const gosysUrl = useMemo(
        () =>
            query.data?.gosysBaseUrl && personIdent
                ? `${query.data.gosysBaseUrl}/personoversikt/fnr=${personIdent}`
                : undefined,
        [query.data?.gosysBaseUrl, personIdent]
    );
    const modiaUrl = useMemo(
        () =>
            query.data?.modiaBaseUrl && personIdent
                ? `${query.data.modiaBaseUrl}/person/${personIdent}`
                : undefined,
        [query.data?.modiaBaseUrl, personIdent]
    );
    const harPersonIdentOgEnGyldigLenke = useMemo(
        () => personIdent && (gosysUrl || modiaUrl || aInntektUrl),
        [personIdent, gosysUrl, modiaUrl, aInntektUrl]
    );

    return (
        <InternalHeader>
            <InternalHeader.Title href="/">Nav - Tilbakekreving</InternalHeader.Title>

            <Spacer />

            <Dropdown defaultOpen>
                <InternalHeader.Button as={Dropdown.Toggle}>
                    <MenuGridIcon style={{ fontSize: '1.5rem' }} title="Systemer og oppslagsverk" />
                </InternalHeader.Button>

                {harPersonIdentOgEnGyldigLenke && (
                    <Dropdown.Menu>
                        <Dropdown.Menu.GroupedList>
                            <Dropdown.Menu.GroupedList.Heading>
                                Personoversikt
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
                )}
            </Dropdown>
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

export default FTHeader;
