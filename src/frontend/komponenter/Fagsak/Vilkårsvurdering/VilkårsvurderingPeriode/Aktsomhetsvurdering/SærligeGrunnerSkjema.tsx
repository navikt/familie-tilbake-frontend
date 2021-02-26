import * as React from 'react';

import styled from 'styled-components';

import { Column, Row } from 'nav-frontend-grid';
import { UndertekstBold } from 'nav-frontend-typografi';

import { FamilieCheckbox } from '@navikt/familie-form-elements';

import {
    Aktsomhet,
    SærligeGrunner,
    særligegrunner,
    særligeGrunnerTyper,
} from '../../../../../kodeverk';
import { Spacer20, Spacer8 } from '../../../../Felleskomponenter/Flytelementer';
import { FamilieTilbakeTextArea } from '../../../../Felleskomponenter/Skjemaelementer';
import { useVilkårsvurderingPeriode } from '../VilkårsvurderingPeriodeContext';
import ReduksjonAvBeløpSkjema from './ReduksjonAvBeløpSkjema';

const StyledFamilieCheckbox = styled(FamilieCheckbox)`
    margin-bottom: 5px;
`;

interface IProps {
    uaktsomhetGrad: Aktsomhet;
    erLesevisning: boolean;
}

const SærligeGrunnerSkjema: React.FC<IProps> = ({ uaktsomhetGrad, erLesevisning }) => {
    const {
        vilkårsvurderingPeriode,
        aktsomhetsvurdering,
        oppdaterAktsomhetsvurdering,
    } = useVilkårsvurderingPeriode();

    const onChangeSærligeGrunner = (type: SærligeGrunner) => {
        if (!aktsomhetsvurdering?.særligeGrunner) {
            oppdaterAktsomhetsvurdering({ særligeGrunner: [type] });
            return;
        }
        if (aktsomhetsvurdering?.særligeGrunner?.includes(type)) {
            const index = aktsomhetsvurdering.særligeGrunner.indexOf(type);
            aktsomhetsvurdering.særligeGrunner.splice(index, 1);
            oppdaterAktsomhetsvurdering({ særligeGrunner: aktsomhetsvurdering.særligeGrunner });
        } else {
            const nyTabell = aktsomhetsvurdering?.særligeGrunner?.concat([type]);
            oppdaterAktsomhetsvurdering({ særligeGrunner: nyTabell });
        }
    };

    const onChangeAnnetBegrunnelse = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const nyVerdi = e.target.value;
        oppdaterAktsomhetsvurdering({ annetBegrunnelse: nyVerdi });
    };

    return (
        <div>
            <UndertekstBold>Særlige grunner som er vektlagt (4.ledd)</UndertekstBold>
            <Spacer8 />
            {særligeGrunnerTyper.map((type: SærligeGrunner) => (
                <StyledFamilieCheckbox
                    key={type}
                    label={særligegrunner[type]}
                    erLesevisning={erLesevisning}
                    checked={aktsomhetsvurdering?.særligeGrunner?.includes(type) ? true : false}
                    onChange={() => onChangeSærligeGrunner(type)}
                />
            ))}
            {aktsomhetsvurdering?.særligeGrunner?.includes(SærligeGrunner.ANNET) && (
                <Row>
                    <Column md="1" />
                    <Column md="10">
                        <FamilieTilbakeTextArea
                            name="annetBegrunnelse"
                            maxLength={1500}
                            erLesevisning={erLesevisning}
                            value={
                                aktsomhetsvurdering?.annetBegrunnelse
                                    ? aktsomhetsvurdering.annetBegrunnelse
                                    : ''
                            }
                            onChange={onChangeAnnetBegrunnelse}
                        />
                    </Column>
                </Row>
            )}
            <Spacer20 />
            <ReduksjonAvBeløpSkjema
                uaktsomhetGrad={uaktsomhetGrad}
                harMerEnnEnAktivitet={
                    vilkårsvurderingPeriode?.ytelser
                        ? vilkårsvurderingPeriode.ytelser.length > 1
                        : false
                }
                erLesevisning={erLesevisning}
            />
        </div>
    );
};

export default SærligeGrunnerSkjema;
