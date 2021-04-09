import * as React from 'react';

import '@navikt/helse-frontend-tidslinje/lib/main.css';

import classNames from 'classnames';
import styled from 'styled-components';

import navFarger from 'nav-frontend-core';
import { Column, Row } from 'nav-frontend-grid';
import { Knapp } from 'nav-frontend-knapper';

import { Periode, Tidslinje } from '@navikt/helse-frontend-tidslinje';

import { Foreldelsevurdering } from '../../../../kodeverk';
import { IBehandling } from '../../../../typer/behandling';
import { ForeldelsePeriode } from '../../../../typer/feilutbetalingtyper';
import { Navigering, Spacer20 } from '../../../Felleskomponenter/Flytelementer';
import { useFeilutbetalingForeldelse } from '../FeilutbetalingForeldelseContext';
import { ForeldelsePeriodeSkjemeData } from '../typer/feilutbetalingForeldelse';
import ForeldelsePeriodeSkjema from './FeilutbetalingForeldelsePeriodeSkjema';

const TidslinjeContainer = styled.div`
    border: 1px solid ${navFarger.navGra60};
    margin-bottom: 20px;

    button.behandlet {
        background-color: ${navFarger.navGronnLighten60};
        border-color: ${navFarger.navGronnLighten40};

        &.aktivPeriode {
            background-color: ${navFarger.navGronnLighten40};
            box-shadow: 0 0 0 2px ${navFarger.navGronn};
        }
    }

    button.foreldet {
        background-color: ${navFarger.navRodLighten60};
        border-color: ${navFarger.navRodLighten40};

        &.aktivPeriode {
            background-color: ${navFarger.navRodLighten40};
            box-shadow: 0 0 0 2px ${navFarger.navRod};
        }
    }

    button.ubehandlet {
        background-color: ${navFarger.navOransjeLighten60};
        border-color: ${navFarger.navOransjeLighten40};

        &.aktivPeriode {
            background-color: ${navFarger.navOransjeLighten40};
            box-shadow: 0 0 0 2px ${navFarger.navOransje};
        }
    }
`;

const finnClassNamePeriode = (periode: ForeldelsePeriode, aktivPeriode: boolean) => {
    const aktivPeriodeCss = aktivPeriode ? 'aktivPeriode' : '';
    switch (periode.foreldelsesvurderingstype) {
        case Foreldelsevurdering.FORELDET:
            return classNames('foreldet', aktivPeriodeCss);
        case Foreldelsevurdering.TILLEGGSFRIST:
        case Foreldelsevurdering.IKKE_FORELDET:
            return classNames('behandlet', aktivPeriodeCss);
        case Foreldelsevurdering.IKKE_VURDERT:
        case Foreldelsevurdering.UDEFINERT:
        default:
            return classNames('ubehandlet', aktivPeriodeCss);
    }
};

const genererRader = (
    perioder: ForeldelsePeriode[],
    valgtPeriode: ForeldelsePeriode | undefined
): Periode[][] => {
    return [
        perioder.map(
            (periode, index): Periode => {
                const erAktivPeriode =
                    !!valgtPeriode &&
                    periode.periode.fom === valgtPeriode.periode.fom &&
                    periode.periode.tom === valgtPeriode.periode.tom;
                return {
                    tom: new Date(periode.periode.tom),
                    fom: new Date(periode.periode.fom),
                    status: 'suksess',
                    active: erAktivPeriode,
                    id: `index_${index}`,
                    className: finnClassNamePeriode(periode, erAktivPeriode),
                };
            }
        ),
    ];
};

interface IProps {
    behandling: IBehandling;
    perioder: ForeldelsePeriodeSkjemeData[];
    erLesevisning: boolean;
}

const ForeldelsePerioder: React.FC<IProps> = ({ behandling, perioder, erLesevisning }) => {
    const [tidslinjeRader, settTidslinjeRader] = React.useState<Periode[][]>();
    const [disableBekreft, settDisableBekreft] = React.useState<boolean>(true);
    const {
        valgtPeriode,
        settValgtPeriode,
        stegErBehandlet,
        erAutoutført,
        gåTilForrige,
        gåTilNeste,
        allePerioderBehandlet,
        sendInnSkjema,
        senderInn,
    } = useFeilutbetalingForeldelse();

    React.useEffect(() => {
        settTidslinjeRader(genererRader(perioder, valgtPeriode));
    }, [perioder, valgtPeriode]);

    React.useEffect(() => {
        if (!valgtPeriode) {
            settDisableBekreft(!allePerioderBehandlet);
        } else {
            settDisableBekreft(true);
        }
    }, [valgtPeriode, allePerioderBehandlet]);

    const onSelectPeriode = (periode: Periode): void => {
        const periodeFom = periode.fom.toISOString().substring(0, 10);
        const periodeTom = periode.tom.toISOString().substring(0, 10);
        const foreldelsePeriode = perioder.find(
            per => per.periode.fom === periodeFom && per.periode.tom === periodeTom
        );
        settValgtPeriode(foreldelsePeriode);
    };

    return perioder && tidslinjeRader ? (
        <>
            <Row>
                <Column xs="12">
                    <TidslinjeContainer>
                        <Tidslinje rader={tidslinjeRader} onSelectPeriode={onSelectPeriode} />
                    </TidslinjeContainer>
                </Column>
            </Row>
            {!!valgtPeriode && (
                <>
                    <Spacer20 />
                    <Row>
                        <Column xs="12">
                            <ForeldelsePeriodeSkjema
                                behandling={behandling}
                                periode={valgtPeriode}
                                erLesevisning={erLesevisning}
                            />
                        </Column>
                    </Row>
                </>
            )}
            <Spacer20 />
            <Row>
                <Column md="12">
                    <Navigering>
                        <div>
                            {erAutoutført || (stegErBehandlet && erLesevisning) ? (
                                <Knapp type={'hoved'} mini={true} onClick={gåTilNeste}>
                                    Neste
                                </Knapp>
                            ) : (
                                <Knapp
                                    type={'hoved'}
                                    mini={true}
                                    onClick={sendInnSkjema}
                                    spinner={senderInn}
                                    autoDisableVedSpinner
                                    disabled={disableBekreft}
                                >
                                    {stegErBehandlet ? 'Neste' : 'Bekreft og fortsett'}
                                </Knapp>
                            )}
                        </div>
                        <div>
                            <Knapp type={'standard'} mini={true} onClick={gåTilForrige}>
                                Forrige
                            </Knapp>
                        </div>
                    </Navigering>
                </Column>
            </Row>
        </>
    ) : null;
};

export default ForeldelsePerioder;
