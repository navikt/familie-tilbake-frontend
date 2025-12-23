import type { SchemaEnum4 } from '../../../generated';

import { Heading } from '@navikt/ds-react';
import * as React from 'react';

import { useFakta } from './FaktaContext';
import GammelFaktaSkjema from './GammelFaktaSkjema';
import { useBehandling } from '../../../context/BehandlingContext';
import { RessursStatus } from '../../../typer/ressurs';
import DataLastIkkeSuksess from '../../Felleskomponenter/Datalast/DataLastIkkeSuksess';
import { Spacer20 } from '../../Felleskomponenter/Flytelementer';
import Steginformasjon from '../../Felleskomponenter/Steginformasjon/StegInformasjon';

type Props = {
    ytelse: SchemaEnum4;
};

const FaktaContainer: React.FC<Props> = ({ ytelse }) => {
    const { stegErBehandlet, skjemaData, fakta } = useFakta();
    const { behandlingILesemodus } = useBehandling();
    const erLesevisning = !!behandlingILesemodus;

    if (fakta?.status === RessursStatus.Suksess) {
        return (
            <>
                <Heading level="1" size="small" spacing>
                    Fakta fra feilutbetalingssaken
                </Heading>
                {(!erLesevisning || stegErBehandlet) && (
                    <>
                        <Steginformasjon
                            behandletSteg={stegErBehandlet}
                            infotekst="Kontroller at korrekt hendelse er satt"
                        />
                        <Spacer20 />
                    </>
                )}
                <GammelFaktaSkjema
                    skjemaData={skjemaData}
                    fakta={fakta.data}
                    ytelse={ytelse}
                    erLesevisning={erLesevisning}
                />
            </>
        );
    } else {
        return <DataLastIkkeSuksess ressurser={[fakta]} />;
    }
};

export default FaktaContainer;
