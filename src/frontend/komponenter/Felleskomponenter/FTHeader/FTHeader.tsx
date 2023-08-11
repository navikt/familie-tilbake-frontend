import * as React from 'react';

import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Dropdown, InternalHeader } from '@navikt/ds-react';
import {
    AFontLineHeightHeadingMedium,
    AFontSizeHeadingMedium,
    ATextOnInverted,
    ASpacing3,
} from '@navikt/ds-tokens/dist/tokens';
import { type ISaksbehandler } from '@navikt/familie-typer';

const StyledHeader = styled(InternalHeader)`
    justify-content: space-between;
`;

const StyledTitle = styled(InternalHeader.Title)`
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
                <StyledLink to="/">NAV Familie - Tilbakekreving</StyledLink>
            </StyledTitle>
            <Dropdown>
                <InternalHeader.UserButton
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
                        <a href={`${window.origin}/auth/logout`}>
                            <Dropdown.Menu.List.Item>Logg ut</Dropdown.Menu.List.Item>
                        </a>
                    </Dropdown.Menu.List>
                </Dropdown.Menu>
            </Dropdown>
        </StyledHeader>
    );
};

export default FTHeader;
