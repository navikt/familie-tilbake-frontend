const originalModule = jest.requireActual('react-router-dom');

module.exports = {
    __esModule: true,
    ...originalModule,
    useLocation: jest.fn(),
    useNavigate: jest.fn(),
};
