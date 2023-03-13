const blessed = require('blessed');

// Create a screen object
const screen = blessed.screen({
  smartCSR: true
});

// Create a box for the menu
const menuBox = blessed.box({
  top: 'center',
  left: 'center',
  width: '50%',
  height: '50%',
  content: 'Select an option:\n\n1. Create student record\n2. Display student record\n3. Quit',
  tags: true,
  border: {
    type: 'line'
  },
  style: {
    fg: 'white',
    bg: 'blue',
    border: {
      fg: '#f0f0f0'
    },
    hover: {
      bg: 'green'
    }
  }
});

// Create a popup box for the message
const messageBox = blessed.box({
  top: 'center',
  left: 'center',
  width: '50%',
  height: 'shrink',
  content: '',
  tags: true,
  border: {
    type: 'line'
  },
  style: {
    fg: 'white',
    bg: 'magenta',
    border: {
      fg: '#f0f0f0'
    },
    hover: {
      bg: 'green'
    }
  },
  hidden: true
});

// Append the boxes to the screen
screen.append(menuBox);
screen.append(messageBox);

// Focus the menu box
menuBox.focus();

// Handle keyboard input
menuBox.key(['up', 'down'], function(ch, key) {
  if (key.name === 'up') {
    menuBox.content = menuBox.content.replace(/(1\.|2\.|3\.)/g, function(match) {
      switch (match) {
        case '1.': return '{blue-fg}{bold}' + match + '{/bold}{/blue-fg}';
        case '2.': return '2.';
        case '3.': return '3.';
        default: return match;
      }
    });
  }
  else if (key.name === 'down') {
    menuBox.content = menuBox.content.replace(/(1\.|2\.|3\.)/g, function(match) {
      switch (match) {
        case '1.': return '1.';
        case '2.': return '2.';
        case '3.': return '{blue-fg}{bold}' + match + '{/bold}{/blue-fg}';
        default: return match;
      }
    });
  }
  screen.render();
});

// Handle menu selection
menuBox.key('enter', function(ch, key) {
  switch (menuBox.content.slice(0, 1)) {
    case '1': messageBox.content = '{center}Creating{/center}'; break;
    case '2': messageBox.content = '{center}Displaying{/center}'; break;
    case '3': messageBox.content = '{center}Quitting{/center}'; break;
  }
  messageBox.show();
  // Hide the message box after 2 seconds
  setTimeout(function() {
    messageBox.hide();
    messageBox.content = '';
    menuBox.focus();
    screen.render();
    if (menuBox.content.slice(0, 1) === '3') {
      process.exit(0);
    }
    }, 2000);
  });
  
  // Quit on Escape or q
  screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
  });
  
  // Render the screen
  screen.render();