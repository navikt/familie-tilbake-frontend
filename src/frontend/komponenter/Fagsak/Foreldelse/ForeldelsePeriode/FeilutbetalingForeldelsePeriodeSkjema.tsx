import * as React from 'react';

import styled from 'styled-components';

import navFarger from 'nav-frontend-core';
import { Column, Row } from 'nav-frontend-grid';
import { Radio } from 'nav-frontend-skjema';
import { Undertittel } from 'nav-frontend-typografi';

import { FamilieDatovelger, FamilieRadioGruppe } from '@navikt/familie-form-elements';

import {
    Foreldelsevurdering,
    foreldelsevurderinger,
    foreldelseVurderingTyper,
} from '../../../../kodeverk';
import { ForeldelsePeriode } from '../../../../typer/feilutbetalingtyper';
import { datoformatNorsk } from '../../../../utils';
import { Spacer20 } from '../../../Felleskomponenter/Flytelementer';
import PeriodeOppsummering from '../../../Felleskomponenter/Periodeinformasjon/PeriodeOppsummering';
import { FamilieTilbakeTextArea } from '../../../Felleskomponenter/Skjemaelementer';

const StyledContainer = styled.div`
    border: 1px solid ${navFarger.navGra60};
    padding: 10px;
`;

const Spacer8 = styled.div`
    height: 8px;
`;

interface IProps {
    periode: ForeldelsePeriode;
    erLesevisning: boolean;
}

const ForeldelsePeriodeSkjema: React.FC<IProps> = ({ periode, erLesevisning }) => {
    const [
        valgtForeldelsevurdering,
        settValgtForeldelsevurdering,
    ] = React.useState<Foreldelsevurdering>();
    const [begrunnelse, settBegrunnelse] = React.useState<string>();
    const [foreldelsesfrist, settForeldelsesfrist] = React.useState<string>();
    const [oppdagelsesDato, settOppdagelsesDato] = React.useState<string>();

    React.useEffect(() => {
        settValgtForeldelsevurdering(periode.foreldelseVurderingType);
        settBegrunnelse(periode.begrunnelse);
        settForeldelsesfrist(periode.foreldelsesfrist);
        settOppdagelsesDato(periode.oppdagelsesDato);
    }, [periode]);

    const onChangeForeldet = (nyVerdi: Foreldelsevurdering) => {
        settValgtForeldelsevurdering(nyVerdi);
    };

    const onChangeBegrunnelse = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const nyVerdi = e.target.value;
        settBegrunnelse(nyVerdi);
    };

    const erForeldet = valgtForeldelsevurdering === Foreldelsevurdering.FORELDET;
    const erMedTilleggsfrist = valgtForeldelsevurdering === Foreldelsevurdering.TILLEGGSFRIST;

    return (
        <StyledContainer>
            <Row>
                <Column xs="8">
                    <Undertittel>Detaljer for valgt periode</Undertittel>
                    <PeriodeOppsummering
                        fom={periode.periode.fom}
                        tom={periode.periode.tom}
                        beløp={periode.feilutbetaltBeløp}
                    />
                </Column>
            </Row>
            <Spacer20 />
            <Row>
                <Column xs="12">
                    <Row>
                        <Column md="8">
                            <FamilieTilbakeTextArea
                                id={'begrunnelse'}
                                name="begrunnelse"
                                label={'Vurdering'}
                                maxLength={1500}
                                erLesevisning={erLesevisning}
                                value={begrunnelse ? begrunnelse : ''}
                                onChange={event => onChangeBegrunnelse(event)}
                            />
                        </Column>
                    </Row>
                </Column>
            </Row>
            <Spacer20 />
            <Row>
                <Column md="6">
                    <FamilieRadioGruppe
                        id="foreldet"
                        erLesevisning={erLesevisning}
                        legend="Vurder om perioden er foreldet"
                        verdi={
                            periode.foreldelseVurderingType
                                ? foreldelsevurderinger[periode.foreldelseVurderingType]
                                : ''
                        }
                    >
                        {foreldelseVurderingTyper.map(type => (
                            <Radio
                                key={type}
                                name="foreldet"
                                label={foreldelsevurderinger[type]}
                                value={type}
                                checked={valgtForeldelsevurdering === type}
                                onChange={() => onChangeForeldet(type)}
                            />
                        ))}
                    </FamilieRadioGruppe>
                </Column>
                <Column md="6">
                    {(erForeldet || erMedTilleggsfrist) && (
                        <FamilieDatovelger
                            id="foreldelsesfrist"
                            label={'Foreldelsesfrist'}
                            erLesesvisning={erLesevisning}
                            onChange={(nyDato?: string) => {
                                settForeldelsesfrist(nyDato ? nyDato : '');
                            }}
                            valgtDato={foreldelsesfrist}
                            placeholder={datoformatNorsk.DATO}
                        />
                    )}
                    {erMedTilleggsfrist && (
                        <>
                            <Spacer8 />
                            <FamilieDatovelger
                                id="oppdagelsesDato"
                                label={'Dato for når feilutbetaling ble oppdaget'}
                                erLesesvisning={erLesevisning}
                                onChange={(nyDato?: string) => {
                                    settOppdagelsesDato(nyDato ? nyDato : '');
                                }}
                                valgtDato={oppdagelsesDato}
                                limitations={{
                                    maxDate: new Date().toISOString(),
                                }}
                                placeholder={datoformatNorsk.DATO}
                            />
                        </>
                    )}
                </Column>
            </Row>
        </StyledContainer>
    );
};

export default ForeldelsePeriodeSkjema;
