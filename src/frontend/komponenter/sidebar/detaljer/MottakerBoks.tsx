import type { FC } from 'react';
import type { KjønnEnum } from '@/generated';

import { CopyButton, Heading, Tag } from '@navikt/ds-react';

import { useFagsak } from '@/context/FagsakContext';
import { formatterDatostring, hentAlder } from '@/utils';
import { Hendelser, Sporingskontekst, sporHendelse } from '@/utils/sporing';

const erDNummer = (personIdent: string): boolean => personIdent.charAt(0) > '3';

const formatterPersonIdent = (personIdent: string): string =>
    personIdent.replace(/(\d{6})(\d{5})/, '$1 $2');

const formatterOrgNummer = (orgNummer: string): string =>
    orgNummer.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');

const mapKjønn = (kjønn: KjønnEnum): string => {
    switch (kjønn) {
        case 'MANN':
            return 'Mann';
        case 'KVINNE':
            return 'Kvinne';
        case 'UKJENT':
        default:
            return 'Ukjent';
    }
};

export const MottakerBoks: FC = () => {
    const { bruker, institusjon } = useFagsak();

    return (
        <section
            aria-label="Mottaker-informasjon"
            className="flex flex-col gap-2 rounded-xl border border-ax-border-brand-blue-subtle p-4"
        >
            <Heading level="3" size="xsmall" className="text-ax-text-neutral-subtle">
                Mottaker
            </Heading>
            <dl className="flex flex-col gap-y-4 text-ax-medium">
                <div className="flex flex-col gap-1">
                    <dt>Navn</dt>
                    <dd>{bruker.navn}</dd>
                </div>
                {bruker.fødselsdato && (
                    <div className="flex flex-col gap-1">
                        <dt className=" text-ax-text-neutral-subtle">Alder</dt>
                        <dd>{hentAlder(bruker.fødselsdato, bruker.dødsdato)} år</dd>
                    </div>
                )}

                <div className="grid grid-cols-2">
                    <div className="flex flex-col gap-1">
                        <dt className=" text-ax-text-neutral-subtle">
                            {erDNummer(bruker.personIdent) ? 'D-nummer' : 'Fødselsnummer'}
                        </dt>
                        <dd className="flex items-center gap-1">
                            <span aria-hidden>{formatterPersonIdent(bruker.personIdent)}</span>
                            <span className="sr-only">
                                {bruker.personIdent.split('').join(' ')}
                            </span>
                            <CopyButton
                                copyText={bruker.personIdent}
                                className="p-0"
                                title="Kopier fødselsnummer"
                                onClick={(): void =>
                                    sporHendelse(Hendelser.TEKST_KOPIERT, {
                                        tekst: erDNummer(bruker.personIdent)
                                            ? 'D-nummer'
                                            : 'Fødselsnummer',
                                        kontekst: Sporingskontekst.Sidebar,
                                        komponentId: 'brukerinformasjon',
                                    })
                                }
                            />
                        </dd>
                    </div>
                    <div className="flex flex-col gap-1">
                        <dt className="text-ax-text-neutral-subtle">Kjønn</dt>
                        <dd>{mapKjønn(bruker.kjønn)}</dd>
                    </div>
                </div>

                {bruker.dødsdato && (
                    <div className="flex flex-col gap-1">
                        <dt className="text-ax-text-neutral-subtle">Dødsdato</dt>
                        <dd>
                            <Tag size="small" variant="strong">
                                {formatterDatostring(bruker.dødsdato)}
                            </Tag>
                        </dd>
                    </div>
                )}
                {institusjon && (
                    <>
                        <div className="flex flex-col gap-1">
                            <dt className="text-ax-text-neutral-subtle">Institusjon</dt>
                            <dd>{institusjon.navn}</dd>
                        </div>

                        <div className="flex flex-col gap-1">
                            <dt className="text-ax-text-neutral-subtle">Organisasjonsnummer</dt>
                            <dd className="flex items-center gap-1">
                                <span aria-hidden>
                                    {formatterOrgNummer(institusjon.organisasjonsnummer)}
                                </span>
                                <span className="sr-only">
                                    {institusjon.organisasjonsnummer.split('').join(' ')}
                                </span>
                                <CopyButton
                                    copyText={institusjon.organisasjonsnummer}
                                    className="p-0"
                                    title="Kopier organisasjonsnummer"
                                    onClick={(): void =>
                                        sporHendelse(Hendelser.TEKST_KOPIERT, {
                                            tekst: 'Organisasjonsnummer',
                                            kontekst: Sporingskontekst.Sidebar,
                                            komponentId: 'brukerinformasjon',
                                        })
                                    }
                                />
                            </dd>
                        </div>
                    </>
                )}
            </dl>
        </section>
    );
};
