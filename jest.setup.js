jest.mock('@expo/vector-icons', () => {
	const React = require('react');
	const { Text } = require('react-native');
	return {
		FontAwesome5: ({ name }) => <Text>{`Icon: ${name}`}</Text>,
	};
});