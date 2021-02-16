import * as React from 'react';

import classNames from 'classnames';
import styled from 'styled-components';

import Modal from 'nav-frontend-modal';
import { Undertittel } from 'nav-frontend-typografi';

import { IModal } from '../../../context/AppContext';

const StyledModal = styled(Modal)`
    .uimodal {
        width: 35rem;
        min-height: 12rem;
        color: @navMorkGra;

        &__content {
            padding: 0.5rem 1.5rem;

            &--inner-content {
                margin-top: 2rem;
            }

            &--actions {
                margin-top: 1rem;
                margin-bottom: 0.5rem;
                display: flex;
                justify-content: flex-end;

                .knapp:not(:first-child) {
                    margin-left: 1rem;
                }
            }
        }
    }
`;

interface IProps {
    modal: IModal;
}

const UIModalWrapper: React.FunctionComponent<IProps> = ({ modal, children }) => {
    const { tittel, visModal, onClose, lukkKnapp, actions, className, innhold } = modal;

    return (
        <StyledModal
            className={classNames(className, 'uimodal')}
            isOpen={visModal}
            onRequestClose={(): void => onClose && onClose()}
            contentLabel="ui-modal"
            closeButton={lukkKnapp}
        >
            <div className="uimodal__content">
                <Undertittel children={tittel} />
                <div className="uimodal__content--inner-content">
                    {innhold ? innhold() : children}
                </div>
                {actions && <div className="uimodal__content--actions"> {actions} </div>}
            </div>
        </StyledModal>
    );
};

export default UIModalWrapper;
