import type { FC } from 'react';
import type { InnloggetRolleEnum } from '@/generated';
import type { PersonvernState } from '@/pages/Personvern';

import { ExternalLinkIcon, LeaveIcon, MenuGridIcon, MoonIcon, SunIcon } from '@navikt/aksel-icons';
import { ActionMenu, Dropdown, HStack, InternalHeader, Spacer, Tag, Theme } from '@navikt/ds-react';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Link, useLocation } from 'react-router';

import { hentAInntektUrl, hentBrukerlenkeBaseUrl } from '@/api/brukerlenker';
import { useHttp } from '@/api/http/HttpProvider';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { useBehandlingStore } from '@/stores/behandlingStore';
import { useFagsakStore } from '@/stores/fagsakStore';
import { baseRolleTag, type RolleTag } from '@/utils/rolle';
import { erHistoriskSide } from '@/utils/sider';
import { Hendelser, Sporingskontekst, sporHendelse } from '@/utils/sporing';

import { Høytidspynt } from './høytidstema/Høytidspynt';

const rolleTags: Record<InnloggetRolleEnum, RolleTag | undefined> = {
    ...baseRolleTag,
    VEILEDER: { label: 'Veileder', dataColor: 'brand-beige' },
    INGEN: undefined,
};

export const Header: FC = () => {
    const routeLocation = useLocation();
    const { innloggetSaksbehandler } = useApp();
    const { data: brukerlenker } = useQuery({
        queryKey: ['hentBrukerlenkeBaseUrl'],
        queryFn: hentBrukerlenkeBaseUrl,
    });
    const { aInntektUrl: reserveAInntektUrl, modiaBaseUrl, gosysBaseUrl } = brukerlenker || {};
    const { behandlingId, rolle, erNyModell } = useBehandlingStore();
    const { fagsystem, tilbakekrevingSakId, personIdent, fagsakBehandlingUrl } = useFagsakStore();

    const { request } = useHttp();
    const behandlingssti = /^\/fagsystem\/[^/]+\/fagsak\/[^/]+\/behandling\/[^/]+/.exec(
        routeLocation.pathname
    )?.[0];
    const { data: personligAInntektUrl } = useQuery({
        queryKey: ['hentAInntektUrl', personIdent],
        queryFn: () => hentAInntektUrl(request, personIdent, tilbakekrevingSakId, behandlingId),
        enabled: !!personIdent && !!tilbakekrevingSakId && !!behandlingId,
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
        if (!fagsakBehandlingUrl && fagsystem && tilbakekrevingSakId) {
            return `/redirect/fagsystem/${fagsystem}/fagsak/${tilbakekrevingSakId}/saksoversikt`;
        }
        return fagsakBehandlingUrl;
    }, [erHistoriskVisning, fagsystem, tilbakekrevingSakId, behandlingsPath, fagsakBehandlingUrl]);
    const { theme, toggleTheme } = useTheme();

    return (
        <InternalHeader>
            <InternalHeader.Title
                as={Link}
                to="/"
                className="text-nowrap"
                onClick={(): void =>
                    sporHendelse(Hendelser.NAVIGERE, {
                        lenketekst: 'Nav Tilbakekreving',
                        destinasjon: '/',
                        kontekst: Sporingskontekst.Header,
                    })
                }
            >
                Nav Tilbakekreving
            </InternalHeader.Title>
            <Høytidspynt />
            <Spacer />

            {rolleTags[rolle] && erNyModell && (
                <HStack align="center" paddingInline="space-16">
                    <Tag data-color={rolleTags[rolle].dataColor} variant="moderate" size="small">
                        {rolleTags[rolle].label}
                    </Tag>
                </HStack>
            )}

            <ActionMenu>
                <ActionMenu.Trigger>
                    <InternalHeader.Button>
                        <MenuGridIcon
                            style={{ fontSize: '1.5rem' }}
                            title="Systemer, oppslagsverk og personvern"
                        />
                    </InternalHeader.Button>
                </ActionMenu.Trigger>
                <Theme theme={theme} asChild>
                    <ActionMenu.Content>
                        {harGyldigLenke && (
                            <ActionMenu.Group label="Systemer og oppslagsverk">
                                {aInntektUrl && (
                                    <ActionMenu.Item
                                        as="a"
                                        icon={<ExternalLinkIcon />}
                                        iconPosition="right"
                                        target="_blank"
                                        href={aInntektUrl}
                                        onClick={(): void =>
                                            sporHendelse(Hendelser.NAVIGERE, {
                                                lenketekst: 'A-inntekt',
                                                destinasjon: aInntektUrl,
                                                lenkegruppe: 'systemer-og-oppslagsverk',
                                                kontekst: Sporingskontekst.Header,
                                            })
                                        }
                                    >
                                        {personligAInntektUrl
                                            ? 'A-inntekt personoversikt'
                                            : 'A-inntekt'}
                                    </ActionMenu.Item>
                                )}
                                {gosysUrl && (
                                    <ActionMenu.Item
                                        as="a"
                                        icon={<ExternalLinkIcon />}
                                        iconPosition="right"
                                        target="_blank"
                                        href={gosysUrl}
                                        onClick={(): void => {
                                            if (gosysBaseUrl) {
                                                sporHendelse(Hendelser.NAVIGERE, {
                                                    lenketekst: personIdent
                                                        ? 'Gosys personoversikt'
                                                        : 'Gosys',
                                                    destinasjon: gosysBaseUrl,
                                                    lenkegruppe: 'systemer-og-oppslagsverk',
                                                    kontekst: Sporingskontekst.Header,
                                                });
                                            }
                                        }}
                                    >
                                        {personIdent ? 'Gosys personoversikt' : 'Gosys'}
                                    </ActionMenu.Item>
                                )}
                                {modiaUrl && (
                                    <ActionMenu.Item
                                        as="a"
                                        icon={<ExternalLinkIcon />}
                                        iconPosition="right"
                                        target="_blank"
                                        href={modiaUrl}
                                        onClick={(): void => {
                                            if (modiaBaseUrl) {
                                                sporHendelse(Hendelser.NAVIGERE, {
                                                    lenketekst: personIdent
                                                        ? 'Modia personoversikt'
                                                        : 'Modia',
                                                    destinasjon: modiaBaseUrl,
                                                    lenkegruppe: 'systemer-og-oppslagsverk',
                                                    kontekst: Sporingskontekst.Header,
                                                });
                                            }
                                        }}
                                    >
                                        {personIdent ? 'Modia personoversikt' : 'Modia'}
                                    </ActionMenu.Item>
                                )}
                                {saksoversiktUrl && (
                                    <ActionMenu.Item
                                        as="a"
                                        icon={<ExternalLinkIcon />}
                                        iconPosition="right"
                                        target="_blank"
                                        href={saksoversiktUrl}
                                        onClick={(): void =>
                                            sporHendelse(Hendelser.NAVIGERE, {
                                                lenketekst: 'Gå til saksoversikt',
                                                destinasjon: fagsakBehandlingUrl
                                                    ? 'fagsakBehandlingUrl'
                                                    : 'oppbygd url',
                                                lenkegruppe: 'systemer-og-oppslagsverk',
                                                kontekst: Sporingskontekst.Header,
                                            })
                                        }
                                    >
                                        Gå til saksoversikt
                                    </ActionMenu.Item>
                                )}
                            </ActionMenu.Group>
                        )}
                        {harGyldigLenke && <ActionMenu.Divider />}
                        <ActionMenu.Group label="Personvern og sikkerhet">
                            <ActionMenu.Item
                                as={Link}
                                to="/personvern"
                                state={
                                    behandlingssti &&
                                    ({ returnTo: behandlingssti } satisfies PersonvernState)
                                }
                                onClick={(): void =>
                                    sporHendelse(Hendelser.NAVIGERE, {
                                        lenketekst: 'Personvern i Tilbakeløsningen',
                                        destinasjon: '/personvern',
                                        lenkegruppe: 'personvern-og-sikkerhet',
                                        kontekst: Sporingskontekst.Header,
                                    })
                                }
                            >
                                Personvern i Tilbakeløsningen
                            </ActionMenu.Item>
                        </ActionMenu.Group>
                    </ActionMenu.Content>
                </Theme>
            </ActionMenu>
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
            <InternalHeader.Button
                onClick={(): void => {
                    sporHendelse(Hendelser.KNAPP_KLIKKET, {
                        tekst: theme === 'light' ? 'Bytt til mørkt tema' : 'Bytt til lyst tema',
                        kontekst: Sporingskontekst.Header,
                        komponentId: 'bytt-tema',
                    });
                    toggleTheme();
                }}
                aria-label="Bytt tema"
            >
                {theme === 'light' ? (
                    <MoonIcon title="Bytt til mørkt tema" />
                ) : (
                    <SunIcon title="Bytt til lyst tema" />
                )}
            </InternalHeader.Button>
        </InternalHeader>
    );
};
