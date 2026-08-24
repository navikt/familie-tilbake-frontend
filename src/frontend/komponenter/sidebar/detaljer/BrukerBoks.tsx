import type { FC, ReactNode } from 'react';
import type { KjønnEnum } from '@/generated';

import {
    BagdeIcon,
    Buildings2Icon,
    CandleIcon,
    FigureCombinationIcon,
    FigureInwardIcon,
    FigureOutwardIcon,
    FlowerPetalFallingIcon,
} from '@navikt/aksel-icons';
import { CopyButton, Heading, Tag } from '@navikt/ds-react';

import { useFagsak } from '@/context/FagsakContext';
import { formatterDatostring, hentAlder } from '@/utils';
import { Hendelser, Sporingskontekst, sporHendelse } from '@/utils/sporing';

import { ICON_PROPS } from './utils';

const erDNummer = (personIdent: string): boolean => personIdent.charAt(0) > '3';

const formatterPersonIdent = (personIdent: string): string =>
    personIdent.replace(/(\d{6})(\d{5})/, '$1 $2');

const formatterOrgNummer = (orgNummer: string): string =>
    orgNummer.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');

const kjønnIkon = (kjønn: KjønnEnum): ReactNode => {
    switch (kjønn) {
        case 'KVINNE':
            return <FigureOutwardIcon {...ICON_PROPS} />;
        case 'MANN':
            return <FigureInwardIcon {...ICON_PROPS} />;
        default:
            return <FigureCombinationIcon {...ICON_PROPS} />;
    }
};

export const BrukerBoks: FC = () => {
    const { bruker, institusjon } = useFagsak();

    return (
        <section
            aria-label="Brukers informasjon"
            className="flex flex-col gap-2 rounded-xl border border-ax-border-brand-blue-subtle p-4"
        >
            <Heading level="3" size="xsmall" className="text-ax-text-neutral-subtle">
                Bruker
            </Heading>
            <dl className="grid grid-cols-[136px_1fr] ax-xl:grid-cols-[152px_1fr] gap-y-2 gap-x-4 text-ax-text-neutral">
                <dt className="text-ax-medium font-ax-bold flex flex-row gap-2 items-center">
                    {kjønnIkon(bruker.kjønn)}
                    Navn
                </dt>
                <dd className="text-ax-medium">{bruker.navn}</dd>

                {bruker.fødselsdato && (
                    <>
                        <dt className="text-ax-medium font-ax-bold flex flex-row gap-2 items-center">
                            <CandleIcon {...ICON_PROPS} />
                            Alder
                        </dt>
                        <dd className="text-ax-medium">
                            {hentAlder(bruker.fødselsdato, bruker.dødsdato)} år
                        </dd>
                    </>
                )}

                <dt className="text-ax-medium font-ax-bold flex flex-row gap-2 items-center">
                    <BagdeIcon {...ICON_PROPS} />
                    {erDNummer(bruker.personIdent) ? 'D-nummer' : 'Fødselsnummer'}
                </dt>
                {/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: TODO a11y – aria-label på element uten rolle, ikke flagget av tidligere ESLint-oppsett */}
                <dd
                    className="text-ax-medium flex flex-row gap-2 items-center"
                    aria-label={formatterPersonIdent(bruker.personIdent).split('').join(' ')}
                >
                    {formatterPersonIdent(bruker.personIdent)}
                    <CopyButton
                        copyText={bruker.personIdent}
                        className="p-0"
                        title="Kopier fødselsnummer"
                        onClick={(): void =>
                            sporHendelse(Hendelser.TEKST_KOPIERT, {
                                tekst: erDNummer(bruker.personIdent) ? 'D-nummer' : 'Fødselsnummer',
                                kontekst: Sporingskontekst.Sidebar,
                                komponentId: 'brukerinformasjon',
                            })
                        }
                    />
                </dd>

                {bruker.dødsdato && (
                    <>
                        <dt className="text-ax-medium font-ax-bold flex flex-row gap-2 items-center">
                            <FlowerPetalFallingIcon {...ICON_PROPS} />
                            Dødsdato
                        </dt>
                        <dd className="text-ax-medium">
                            <Tag data-color="neutral" size="small" variant="strong">
                                {formatterDatostring(bruker.dødsdato)}
                            </Tag>
                        </dd>
                    </>
                )}
                {institusjon && (
                    <>
                        <dt className="text-ax-medium font-ax-bold flex flex-row gap-2 items-center">
                            <Buildings2Icon {...ICON_PROPS} />
                            Institusjon
                        </dt>
                        <dd className="text-ax-medium">{institusjon.navn}</dd>

                        <dt className="text-ax-medium font-ax-bold flex flex-row gap-2 items-center">
                            <Buildings2Icon {...ICON_PROPS} />
                            Org.nummer
                        </dt>
                        {/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: TODO a11y – aria-label på element uten rolle, ikke flagget av tidligere ESLint-oppsett */}
                        <dd
                            className="text-ax-medium flex flex-row gap-2 items-center"
                            aria-label={institusjon.organisasjonsnummer.split('').join(' ')}
                        >
                            {formatterOrgNummer(institusjon.organisasjonsnummer)}
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
                    </>
                )}
            </dl>
        </section>
    );
};
