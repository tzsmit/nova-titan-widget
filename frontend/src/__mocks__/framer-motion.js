// Mock framer-motion for Jest tests

const motion = {
  div: ({ children, ...props }) => {
    const React = require('react');
    return React.createElement('div', props, children);
  },
  button: ({ children, ...props }) => {
    const React = require('react');
    return React.createElement('button', props, children);
  },
  span: ({ children, ...props }) => {
    const React = require('react');
    return React.createElement('span', props, children);
  },
};

const AnimatePresence = ({ children }) => children;

module.exports = {
  motion,
  AnimatePresence,
};