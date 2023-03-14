const fs = require('fs');
const prompt = require('prompt-sync')();

class Database {
  constructor(name) {
    this.name = name;
    this.tables = {};
    this.data = Buffer.alloc(0);
    this.pointer = 0;
    this.create();
  }

  create() {
    fs.writeFileSync(this.name, this.data);
    console.log(`Database "${this.name}" created.`);
  }

  addTable(name, columns) {
    const table = new Table(name, columns, this);
    this.tables[name] = table;
    console.log(`Table "${name}" added to database "${this.name}".`);
    return table;
  }
}

class Table {
  constructor(name, columns, database) {
    this.name = name;
    this.columns = columns;
    this.database = database;
    this.data = Buffer.alloc(0);
    this.pointer = 0;
    this.create();
  }

  create() {
    const columnHeaders = this.columns.join(',');
    const tableHeaders = `${this.name},${columnHeaders}\n`;
    fs.appendFileSync(this.database.name, tableHeaders);
    console.log(`Table "${this.name}" created in database "${this.database.name}".`);
  }

  insert(row) {
    const rowData = `${row.join(',')}\n`;
    fs.appendFileSync(this.database.name, rowData);
    console.log(`Row inserted into "${this.name}" in database "${this.database.name}".`);
  }

  findByAttribute(attribute, value) {
    const rows = this.getRows();
    const index = this.columns.indexOf(attribute);
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][index] === value) {
        return rows[i];
      }
    }
    return null;
  }

  getRows() {
    const data = fs.readFileSync(this.database.name);
    const rows = data.toString().split('\n');
    rows.pop(); // Remove last empty row
    rows.shift(); // Remove header row
    return rows.map(row => row.split(','));
  }
}

// Prompt user for database and table names
const dbName = prompt('Enter database name: ');
const tableName = prompt('Enter table name: ');

// Create database and table
const database = new Database(dbName);
const table = database.addTable(tableName, ['id', 'name', 'age']);

// Insert data into table
table.insert([1, 'John', 30]);
table.insert([2, 'Jane', 25]);
table.insert([3, 'Bob', 40]);

// Find a row by attribute
const attribute = prompt('Enter attribute to search by: ');
const value = prompt(`Enter value of ${attribute}: `);
const row = table.findByAttribute(attribute, value);
if (row) {
  console.log(`Row found: ${row.join(', ')}`);
} else {
  console.log('No rows found.');
}
