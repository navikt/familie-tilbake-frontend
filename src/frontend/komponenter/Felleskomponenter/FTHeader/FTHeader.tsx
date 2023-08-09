import * as React from 'react';

import styled from 'styled-components';

import { Link, Dropdown, InternalHeader as NavHeader } from '@navikt/ds-react';
import {
    AFontLineHeightHeadingMedium,
    AFontSizeHeadingMedium,
    ATextOnInverted,
    ASpacing3,
} from '@navikt/ds-tokens/dist/tokens';
import { type ISaksbehandler } from '@navikt/familie-typer';

const StyledHeader = styled(NavHeader)`
    justify-content: space-between;
`;

const StyledTitle = styled(NavHeader.Title)`
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
                <NavHeader.UserButton
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
