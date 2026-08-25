import type { ComponentType, SVGProps } from 'react';

import {
    ClockDashedIcon,
    EnvelopeClosedIcon,
    FolderFileIcon,
    InformationSquareIcon,
    PersonGavelIcon,
} from '@navikt/aksel-icons';

export enum Menysider {
    Detaljer = 'DETALJER',
    Totrinn = `TOTRINN`,
    Historikk = 'HISTORIKK',
    SendBrev = 'SEND_BREV',
    Dokumenter = 'DOKUMENTER',
}

type MenysideMeta = {
    tittel: string;
    ikon: ComponentType<SVGProps<SVGSVGElement> & { title?: string }>;
    bevarerTilstand?: boolean;
};

export const MENYSIDE_META: Record<Menysider, MenysideMeta> = {
    [Menysider.Detaljer]: { tittel: 'Detaljer', ikon: InformationSquareIcon },
    [Menysider.Historikk]: { tittel: 'Historikk', ikon: ClockDashedIcon },
    [Menysider.Dokumenter]: { tittel: 'Dokumenter', ikon: FolderFileIcon },
    [Menysider.SendBrev]: {
        tittel: 'Send brev',
        ikon: EnvelopeClosedIcon,
        bevarerTilstand: true,
    },
    [Menysider.Totrinn]: {
        tittel: 'Fatte vedtak',
        ikon: PersonGavelIcon,
        bevarerTilstand: true,
    },
};
