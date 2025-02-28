/* eslint-disable */
const originalModule = jest.requireActual('react-router-dom');

export default {
    __esModule: true,
    ...originalModule,
    useLocation: jest.fn(),
    useNavigate: jest.fn(),
};
