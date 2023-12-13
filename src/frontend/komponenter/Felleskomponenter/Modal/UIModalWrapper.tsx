import * as React from 'react';

import classNames from 'classnames';
import { styled } from 'styled-components';

import { Heading, Modal } from '@navikt/ds-react';

interface StyleProps {
    width?: string;
    minHeight?: string;
}

interface ModelStyleProps {
    styleProps?: StyleProps;
}

const StyledModal = styled(Modal)<ModelStyleProps>`
    width: ${({ styleProps }: ModelStyleProps) => (styleProps?.width ? styleProps.width : '30rem')};
    min-height: ${({ styleProps }: ModelStyleProps) =>
        styleProps?.minHeight ? styleProps.minHeight : '12rem'};
    padding: 1rem;
`;

const StyledModalBody = styled(Modal.Body)`
    padding: 0.5rem 1.5rem;
`;

const ModalInnerContent = styled.div`
    margin-top: 1rem;
`;

const StyledModalActions = styled.div`
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    display: flex;
    justify-content: flex-end;

    .knapp:not(:first-child) {
        margin-left: 1rem;
    }
    .navds-button:not(:first-child) {
        margin-left: 1rem;
    }
`;

export interface IModal {
    actions?: JSX.Element[] | JSX.Element;
    className?: string;
    innhold?: () => React.ReactNode;
    lukkKnapp: boolean;
    onClose?: () => void;
    tittel: string;
    visModal: boolean;
    ariaLabel?: string;
}

interface IProps {
    modal: IModal;
    children?: React.ReactNode;
    modelStyleProps?: StyleProps;
}

const UIModalWrapper: React.FunctionComponent<IProps> = ({ modal, modelStyleProps, children }) => {
    const { tittel, visModal, onClose, lukkKnapp, actions, className, innhold, ariaLabel } = modal;

    return (
        <StyledModal
            className={classNames(className)}
            open={visModal}
            onClose={(): void => onClose && onClose()}
            aria-label={ariaLabel ? ariaLabel : tittel}
            styleProps={modelStyleProps}
            portal={true}
        >
            <Modal.Header closeButton={lukkKnapp}>
                <Heading level="2" size="small">
                    {tittel}
                </Heading>
            </Modal.Header>
            <StyledModalBody>
                <ModalInnerContent>{innhold ? innhold() : children}</ModalInnerContent>
            </StyledModalBody>
            {actions && (
                <Modal.Footer>
                    <StyledModalActions>{actions}</StyledModalActions>
                </Modal.Footer>
            )}
        </StyledModal>
    );
};

export default UIModalWrapper;
