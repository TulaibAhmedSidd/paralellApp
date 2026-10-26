const React = require('react');
const { View } = require('react-native');

const mockIcon = (name) => {
  const IconComponent = (props) => React.createElement(View, { testID: `icon-${name}`, ...props });
  IconComponent.displayName = name;
  return IconComponent;
};

module.exports = new Proxy({}, {
  get: (_, prop) => mockIcon(prop),
});
