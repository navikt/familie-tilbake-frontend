import type { ISaksbehandler } from '../../../typer/saksbehandler';

import { ExternalLinkIcon, LeaveIcon, MenuGridIcon } from '@navikt/aksel-icons';
import { Dropdown, InternalHeader, Spacer } from '@navikt/ds-react';
import * as React from 'react';
import { useMemo } from 'react';

import { usePersonIdentStore } from '../../../store/personIdent';

interface IHeaderProps {
    innloggetSaksbehandler?: ISaksbehandler;
}

const FTHeader: React.FC<IHeaderProps> = ({ innloggetSaksbehandler }) => {
    const personIdent = usePersonIdentStore(state => state.personIdent);
    const aInntektUrl = useMemo(
        () => `https://www.a-inntekt.no/inntekt/${personIdent}`,
        [personIdent]
    );
    const gosysUrl = useMemo(
        () => `https://www.gosys.no/personoversikt/fnr=${personIdent}`,
        [personIdent]
    );
    const modiaUrl = useMemo(() => `https://www.modia.no/person/${personIdent}`, [personIdent]);
    return (
        <InternalHeader>
            <InternalHeader.Title href="/">Nav - Tilbakekreving</InternalHeader.Title>

            <Spacer />

            <Dropdown defaultOpen>
                <InternalHeader.Button as={Dropdown.Toggle}>
                    <MenuGridIcon style={{ fontSize: '1.5rem' }} title="Systemer og oppslagsverk" />
                </InternalHeader.Button>

                {personIdent && (
                    <Dropdown.Menu>
                        <Dropdown.Menu.GroupedList>
                            <Dropdown.Menu.GroupedList.Heading>
                                Personoversikt
                            </Dropdown.Menu.GroupedList.Heading>
                            <Dropdown.Menu.GroupedList.Item
                                as="a"
                                target="_blank"
                                href={aInntektUrl}
                            >
                                A-inntekt <ExternalLinkIcon aria-hidden />
                            </Dropdown.Menu.GroupedList.Item>
                            <Dropdown.Menu.GroupedList.Item as="a" target="_blank" href={gosysUrl}>
                                Gosys <ExternalLinkIcon aria-hidden />
                            </Dropdown.Menu.GroupedList.Item>
                            <Dropdown.Menu.GroupedList.Item as="a" target="_blank" href={modiaUrl}>
                                Modia <ExternalLinkIcon aria-hidden />
                            </Dropdown.Menu.GroupedList.Item>
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
