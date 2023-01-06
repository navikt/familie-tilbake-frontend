import * as React from 'react';

import styled from 'styled-components';

import { Link } from '@navikt/ds-react';
import { Dropdown, Header } from '@navikt/ds-react-internal';
import {
    AFontLineHeightHeadingMedium,
    AFontSizeHeadingMedium,
    ATextOnInverted,
    ASpacing3,
} from '@navikt/ds-tokens/dist/tokens';
import { type ISaksbehandler } from '@navikt/familie-typer';

const StyledHeader = styled(Header)`
    justify-content: space-between;
`;

const StyledTitle = styled(Header.Title)`
    margin-left: ${ASpacing3};
    font-size: ${AFontSizeHeadingMedium};
    line-height: ${AFontLineHeightHeadingMedium};
    border: none;
`;

const StyledLink = styled(Link)`
    color: ${ATextOnInverted};
    text-decoration: none;
`;

export interface IHeaderProps {
    innloggetSaksbehandler?: ISaksbehandler;
}

const FTHeader: React.FC<IHeaderProps> = ({ innloggetSaksbehandler }) => {
    return (
        <StyledHeader>
            <StyledTitle as="h1">
                <StyledLink href="/">NAV Familie - Tilbakekreving</StyledLink>
            </StyledTitle>
            <Dropdown>
                <Header.UserButton
                    as={Dropdown.Toggle}
                    name={innloggetSaksbehandler?.displayName || 'ukjent'}
                    description={
                        innloggetSaksbehandler?.enhet
                            ? `Enhet: ${innloggetSaksbehandler.enhet}`
                            : 'ukjent enhet'
                    }
                />
                <Dropdown.Menu>
                    <Dropdown.Menu.List>
                        <Dropdown.Menu.List.Item>
                            <Link href={`${window.origin}/auth/logout`}>Logg ut</Link>
                        </Dropdown.Menu.List.Item>
                    </Dropdown.Menu.List>
                </Dropdown.Menu>
            </Dropdown>
        </StyledHeader>
    );
};

export default FTHeader;
