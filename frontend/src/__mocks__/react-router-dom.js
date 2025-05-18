// src/__mocks__/react-router-dom.js
const React = require('react');

// Simple implementation without createMockFromModule
const reactRouterDom = {
  BrowserRouter: ({ children }) => React.createElement('div', null, children),
  Routes: ({ children }) => React.createElement('div', null, children),
  Route: ({ element }) => React.createElement('div', null, element),
  Link: ({ children, to }) => React.createElement('a', { href: to }, children),
  Navigate: ({ to }) => React.createElement('div', null, `Navigate to ${to}`),
  
  // Mock hooks
  useNavigate: jest.fn().mockReturnValue(jest.fn()),
  useParams: jest.fn().mockReturnValue({}),
  useLocation: jest.fn().mockReturnValue({ pathname: '/' })
};

module.exports = reactRouterDom;
