import type { ISaksbehandler } from '../../../typer/saksbehandler';

import { LeaveIcon } from '@navikt/aksel-icons';
import { Dropdown, InternalHeader, Spacer } from '@navikt/ds-react';
import * as React from 'react';

interface IHeaderProps {
    innloggetSaksbehandler?: ISaksbehandler;
}

const FTHeader: React.FC<IHeaderProps> = ({ innloggetSaksbehandler }) => {
    return (
        <InternalHeader>
            <InternalHeader.Title href="/">Nav - Tilbakekreving</InternalHeader.Title>

            <Spacer />

            <Dropdown>
                <InternalHeader.UserButton
                    as={Dropdown.Toggle}
                    name={innloggetSaksbehandler?.displayName || 'Ukjent'}
                    description={innloggetSaksbehandler?.enhet || 'Ukjent enhet'}
                />
                <Dropdown.Menu>
                    <Dropdown.Menu.List>
                        <Dropdown.Menu.List.Item as="a" href={`${window.origin}/auth/logout`}>
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
