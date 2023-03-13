const blessed = require('blessed');

// Define the options to be displayed
const options = [
  'Create student record',
  'Display student record',
  'Quit'
];

// Initialize blessed screen and box elements
const screen = blessed.screen({
  smartCSR: true,
  title: 'Terminal UI with blessed'
});
const box = blessed.box({
  top: 'center',
  left: 'center',
  width: '50%',
  height: '50%',
  border: {
    type: 'line'
  },
  style: {
    fg: 'white',
    border: {
      fg: '#f0f0f0'
    }
  }
});

// Set up the options menu
const list = blessed.list({
  parent: box,
  top: 'center',
  left: 'center',
  width: '50%',
  height: '50%',
  keys: true,
  vi: true,
  mouse: true,
  style: {
    selected: {
      bg: 'green'
    }
  },
  items: options
});

// Add the box and list to the screen and focus the list
screen.append(box);
list.focus();

// Define a function to handle option selection
function handleOptionSelection(option) {
  switch (option) {
    case 0:
      console.log('Creating student record');
      break;
    case 1:
      console.log('Displaying student record');
      break;
    case 2:
      console.log('Quitting');
      process.exit(0);
      break;
  }
}

// Listen for list item selection and handle it
list.on('select', function (item, index) {
  handleOptionSelection(index);
});

// Listen for keypresses and update the list selection accordingly
screen.key(['up', 'k'], function () {
  list.up(1);
  screen.render();
});

