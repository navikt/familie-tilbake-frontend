/* eslint-disable */
const originalModule = jest.requireActual('react-router');

module.exports = {
    __esModule: true,
    ...originalModule,
    useLocation: jest.fn(),
    useNavigate: jest.fn(),
};
