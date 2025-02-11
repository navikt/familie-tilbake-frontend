import * as React from 'react';

import { styled } from 'styled-components';
import { type ISaksbehandler } from '@navikt/familie-typer';
import { Dropdown, InternalHeader, Link, Spacer } from '@navikt/ds-react';
import { LeaveIcon } from '@navikt/aksel-icons';

interface IHeaderProps {
    innloggetSaksbehandler?: ISaksbehandler;
}

const StyledLink = styled(Link)`
    text-decoration: none;
`;

const FTHeader: React.FC<IHeaderProps> = ({ innloggetSaksbehandler }) => {
    return (
        <InternalHeader>
            <StyledLink href="/" className="">
                <InternalHeader.Title>Nav - Tilbakekreving</InternalHeader.Title>
            </StyledLink>

            <Spacer />

            <Dropdown>
                <InternalHeader.UserButton
                    as={Dropdown.Toggle}
                    name={innloggetSaksbehandler?.displayName || 'Ukjent'}
                />
                <Dropdown.Menu>
                    <Dropdown.Menu.List>
                        <Dropdown.Menu.List.Item>
                            <Link href={`${window.origin}/auth/logout`}>
                                Logg ut <Spacer /> <LeaveIcon aria-hidden fontSize="1.5rem" />
                            </Link>
                        </Dropdown.Menu.List.Item>
                    </Dropdown.Menu.List>
                </Dropdown.Menu>
            </Dropdown>
        </InternalHeader>
    );
};

export default FTHeader;
