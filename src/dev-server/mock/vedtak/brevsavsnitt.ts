import { Avsnittstype, Underavsnittstype } from '../../../frontend/kodeverk';

const vedtaksbrevtekster_1 = [
    {
        avsnittstype: Avsnittstype.OPPSUMMERING,
        overskrift: 'Betale tilbake?',
        underavsnittsliste: [
            {
                fritekstTillatt: true,
                fritekstPåkrevet: true,
                overskrift: 'Overskrift 1',
                brødtekst: 'Brødtekst 1',
                fritekst: 'Fritekst 1',
            },
        ],
    },
    {
        avsnittstype: Avsnittstype.PERIODE,
        overskrift: 'Avsnitt 2 - per 1',
        fom: '2013-01-01',
        tom: '2017-04-30',
        underavsnittsliste: [
            {
                underavsnittstype: Underavsnittstype.FAKTA,
                fritekstTillatt: true,
                fritekstPåkrevet: false,
                brødtekst: 'Brødtekst fakta per 1',
                fritekst: 'Fritekst fakta per 1',
            },
            {
                underavsnittstype: Underavsnittstype.FORELDELSE,
                fritekstTillatt: true,
                fritekstPåkrevet: false,
                overskrift: 'Foreldelse per 1',
                brødtekst: 'Brødtekst foreldelse per 1',
            },
        ],
    },
    {
        avsnittstype: Avsnittstype.PERIODE,
        overskrift: 'Avsnitt 3 - per 2',
        fom: '2017-05-01',
        tom: '2020-09-01',
        underavsnittsliste: [
            {
                underavsnittstype: Underavsnittstype.FAKTA,
                fritekstTillatt: true,
                fritekstPåkrevet: false,
                brødtekst: 'Brødtekst fakta per 2',
            },
            {
                underavsnittstype: Underavsnittstype.SÆRLIGEGRUNNER_ANNET,
                fritekstTillatt: true,
                fritekstPåkrevet: true,
                overskrift: 'Oppsummering per 2',
                brødtekst: 'Brødtekst oppsummering per 2',
            },
        ],
    },
    {
        avsnittstype: Avsnittstype.TILLEGGSINFORMASJON,
        overskrift: 'Lovhjemler vi bruker?',
        underavsnittsliste: [
            {
                fritekstTillatt: false,
                overskrift: 'Avsluttende informasjon',
                brødtekst: 'Brødtekst avsluttende informasjon',
            },
        ],
    },
];

export { vedtaksbrevtekster_1 };
