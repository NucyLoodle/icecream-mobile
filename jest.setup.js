jest.mock('@expo/vector-icons', () => {
    const View = require('react-native/Libraries/Components/View/View');
    const MockIcon = (props) => {
      return View; // simple placeholder component
    };
  
    return {
        FontAwesome5: MockIcon,
    };
  });