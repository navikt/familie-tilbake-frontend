import { jest } from '@jest/globals';

const originalModule = jest.requireActual('react-router');

export const useLocation = jest.fn();
export const useNavigate = jest.fn();

export * from 'react-router';

export default {
    ...originalModule,
    useLocation,
    useNavigate,
};
