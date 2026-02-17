import { ExternalLinkIcon, LeaveIcon, MenuGridIcon, MoonIcon, SunIcon } from '@navikt/aksel-icons';
import { Dropdown, InternalHeader, Spacer } from '@navikt/ds-react';
import { useQuery } from '@tanstack/react-query';
import * as React from 'react';
import { useMemo } from 'react';

import { Høytidspynt } from './høytidstema/Høytidspynt';
import { hentAInntektUrl, hentBrukerlenkeBaseUrl } from '../../api/brukerlenker';
import { useHttp } from '../../api/http/HttpProvider';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { Fagsystem } from '../../kodeverk';
import { useBehandlingStore } from '../../stores/behandlingStore';
import { useFagsakStore } from '../../stores/fagsakStore';
import { erHistoriskSide } from '../../utils/sider';

export const Header: React.FC = () => {
    const { innloggetSaksbehandler } = useApp();
    const { data: brukerlenker } = useQuery({
        queryKey: ['hentBrukerlenkeBaseUrl'],
        queryFn: hentBrukerlenkeBaseUrl,
    });
    const { aInntektUrl: reserveAInntektUrl, modiaBaseUrl, gosysBaseUrl } = brukerlenker || {};
    const { behandlingId } = useBehandlingStore();
    const { fagsystem, eksternFagsakId, personIdent } = useFagsakStore();

    const { request } = useHttp();
    const { data: personligAInntektUrl } = useQuery({
        queryKey: ['hentAInntektUrl', personIdent],
        queryFn: () => hentAInntektUrl(request, personIdent, eksternFagsakId, behandlingId),
        enabled: !!personIdent && !!eksternFagsakId && !!behandlingId,
        retry: 1,
    });

    const aInntektUrl = useMemo(
        () => personligAInntektUrl || reserveAInntektUrl,
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

    const behandlingsPath = location.pathname.split('/').at(-1);
    const erHistoriskVisning = behandlingsPath && erHistoriskSide(behandlingsPath);

    const saksoversiktUrl = useMemo(() => {
        if (erHistoriskVisning) {
            return `${location.pathname.replace(behandlingsPath, '')}`;
        }
        if (fagsystem === Fagsystem.TS) {
            return `/redirect/fagsystem/${fagsystem}/ekstern/person/${eksternFagsakId}`;
        }
        return `/redirect/fagsystem/${fagsystem}/fagsak/${eksternFagsakId}/saksoversikt`;
    }, [erHistoriskVisning, fagsystem, eksternFagsakId, behandlingsPath]);
    const { theme, toggleTheme } = useTheme();

    return (
        <InternalHeader>
            <InternalHeader.Title href="/" className="text-nowrap">
                Nav - Tilbakekreving
            </InternalHeader.Title>
            <Høytidspynt />
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
                            {!erHistoriskVisning && (
                                <Dropdown.Menu.GroupedList.Item
                                    as="a"
                                    target="_blank"
                                    href={saksoversiktUrl}
                                >
                                    Gå til saksoversikt
                                    <ExternalLinkIcon aria-hidden />
                                </Dropdown.Menu.GroupedList.Item>
                            )}
                        </Dropdown.Menu.GroupedList>
                    </Dropdown.Menu>
                </Dropdown>
            )}
            <Dropdown>
                <InternalHeader.UserButton
                    className="text-nowrap"
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
            <InternalHeader.Button onClick={toggleTheme} aria-label="Bytt tema">
                {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </InternalHeader.Button>
        </InternalHeader>
    );
};
