export const ICON_PROPS = {
    'aria-hidden': true,
    fontSize: '1.25rem',
    className: 'text-ax-text-neutral-subtle',
} as const;

export const formatterOrgNummer = (orgNummer: string): string =>
    orgNummer.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');

export const erDNummer = (personIdent: string): boolean => personIdent.charAt(0) > '3';

export const formatterPersonIdent = (personIdent: string): string =>
    personIdent.replace(/(\d{6})(\d{5})/, '$1 $2');
