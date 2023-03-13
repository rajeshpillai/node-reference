const fs = require('fs');
const path = require('path');
const readline = require('node:readline');


const DATABASE_FILE = path.join(__dirname, 'students.db');

// Function to check if the database file exists and create it if it doesn't
function createDatabaseFile() {
  return new Promise((resolve, reject) => {
    // Check if the database file exists
    fs.access(DATABASE_FILE, fs.constants.F_OK, (err) => {
      if (err) {
        // File doesn't exist, create it
        const buffer = Buffer.alloc(1024); // Allocate 1 KB of space for the file
        fs.writeFile(DATABASE_FILE, buffer, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      } else {
        // File already exists, resolve the promise
        resolve();
      }
    });
  });
}

// Function to read a student record from the database
function readStudentRecord(rollno) {
  return new Promise((resolve, reject) => {
    // Open the database file in read mode
    const fd = fs.openSync(DATABASE_FILE, 'r');

    // Calculate the byte offset of the student record in the file
    const offset = (rollno - 1) * 32;

    // Read the student record from the file
    const buffer = Buffer.alloc(32);
    fs.readSync(fd, buffer, 0, 32, offset);

    // Close the database file
    fs.closeSync(fd);

    // Parse the student record from the buffer and return it
    const name = buffer.toString('utf8', 0, 16).trim();
    const classCode = buffer.toString('utf8', 16, 20).trim();
    const rollNumber = buffer.readInt32LE(20);
    resolve({ name, class: classCode, rollno: rollNumber });
  });
}

// Function to write a student record to the database
function writeStudentRecord(record) {
  return new Promise((resolve, reject) => {
    // Open the database file in read-write mode
    const fd = fs.openSync(DATABASE_FILE, 'r+');

    // Calculate the byte offset of the student record in the file
    const offset = (record.rollno - 1) * 32;

    // Serialize the student record to a buffer
    const buffer = Buffer.alloc(32);
    buffer.write(record.name.padEnd(16, '\0'), 0, 16, 'utf8');
    buffer.write(record.class.padEnd(4, '\0'), 16, 4, 'utf8');
    buffer.writeInt32LE(record.rollno, 20);

    // Write the student record to the file
    fs.writeSync(fd, buffer, 0, 32, offset);

    // Close the database file
    fs.closeSync(fd);

    resolve();
  });
}

// Function to delete a student record from the database
function deleteStudentRecordByRollNo(rollno) {
  return new Promise((resolve, reject) => {
    // Open the database file in read-write mode
    const fd = fs.openSync(DATABASE_FILE, 'r+');

    // Calculate the byte offset of the student record in the file
    const offset = (rollno - 1) * 32;

    // Create an empty buffer to overwrite the student record
    const buffer = Buffer.alloc(32);

    // Write the empty buffer to the file
    fs.writeSync(fd, buffer, 0, 32, offset);
    // Close the database file
    fs.closeSync(fd);
    resolve();
  });
}

// Function to list all student records in the database
function listAllStudents() {
  return new Promise(async (resolve, reject) => {
    // Open the database file in read mode
    const fd = fs.openSync(DATABASE_FILE, 'r');
    // Iterate over all student records in the file and print them to the console
    const buffer = Buffer.alloc(32);

    const total = await getTotalRecords();
    console.log(`Total records: ${total}`);
    for (let i = 0; i < total; i++) {
      const offset = i * 32;
      fs.readSync(fd, buffer, 0, 32, offset);
      const name = buffer.toString('utf8', 0, 16).trim();
      const classCode = buffer.toString('utf8', 16, 20).trim();
      const rollNumber = buffer.readInt32LE(20);
      if (rollNumber == 0) {
        return;
      }
      if (name || classCode || rollNumber) {
        console.log(`${rollNumber}: ${name} (${classCode})`);
      } 
    }
    // Close the database file
    fs.closeSync(fd);
    resolve();
  });
}

// Function to get the total number of records in the database
// Function to get the total number of records in the database
function getTotalRecords() {
  return new Promise((resolve, reject) => {
    // Open the database file in read mode
    const fd = fs.openSync(DATABASE_FILE, 'r');

    // Iterate over all student records in the file and count the non-empty ones
    let count = 0;
    const buffer = Buffer.alloc(32);
    let bytesRead = 0;
    do {
      bytesRead = fs.readSync(fd, buffer, 0, 32, null);
      const name = buffer.toString('utf8', 0, 16).trim();
      const classCode = buffer.toString('utf8', 16, 20).trim();
      const rollNumber = buffer.readInt32LE(20);
      if (name || classCode || rollNumber) {
        if (rollNumber != 0) {
          count++;
        }
      }
    } while (bytesRead === 32);

    // Close the database file
    fs.closeSync(fd);

    resolve(count);
  });
}


// Example usage
(async () => {
  // Create the database file if it doesn't exist
  await createDatabaseFile();

  // Write a new student record to the database
  await writeStudentRecord({ name: 'Rajesh', class: 'B', rollno: 1 });
  await writeStudentRecord({ name: 'Rohan', class: 'A', rollno: 2 });
  await writeStudentRecord({ name: 'TanuvNair', class: 'A', rollno: 3 });
  await writeStudentRecord({ name: 'Manas', class: 'A', rollno: 4 });

  for(let i = 5; i < 10; i++) {
    await writeStudentRecord({ name: `Xyz${i}`, class: 'B', rollno: i });
  }


  // Read the student record with roll number 1 from the database
  const record = await readStudentRecord(1);
  console.log(record); // { name: 'Rajesh', class: 'A', rollno: 1 }

  const record2 = await readStudentRecord(2);
  console.log(record2); 

  const record3 = await readStudentRecord(3);
  console.log(record3); 

  await listAllStudents();
});//();

// Function to prompt the user for input and return the result as a Promise
function questionAsync(prompt) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// Create student record function
async function createStudentRecord() {
  // Prompt the user for the student record details
  const record = {};
  record.rollno = parseInt(await questionAsync('Enter roll number: '));
  record.name = await questionAsync('Enter name: ');
  record.class = await questionAsync('Enter class: ');
  
  // Write the student record to the database
  await writeStudentRecord(record);
  
  console.log('Student record created.');
}

// Display student record function
async function displayStudentRecord() {
  // Prompt the user for the roll number of the student record to display
  const rollno = parseInt(await questionAsync('Enter roll number: '));
  
  // Read the student record from the database
  const record = await readStudentRecord(rollno);
  
  console.log(`Roll Number: ${record.rollno}`);
  console.log(`Name: ${record.name}`);
  console.log(`Class: ${record.class}`);
}

async function deleteStudentRecord() {
  // Prompt the user for the roll number of the student record to display
  const rollno = parseInt(await questionAsync('Enter roll number: '));
  await deleteStudentRecordByRollNo(rollno);
}

async function main() {
  await createDatabaseFile();
  // Create the readline interface for user input
  mainMenu();
  
  // Main menu function
  async function mainMenu() {
    console.log('Welcome to the Student Database!\n');
    while (true) {
      const choice = await questionAsync(
        'Please select an option:\n' +
        '1. Create student record\n' +
        '2. Display student by roll number\n' +
        '3. Delete student record by roll number\n' +
        '4. List all students\n' +
        '5. Quit\n'
      );
      switch (choice) {
        case '1':
          await createStudentRecord();
          break;
        case '2':
          await displayStudentRecord();
          break;
        case '3':
          await deleteStudentRecord();
          break;
        case '4':
          await listAllStudents();
          break;
        case '5':
          console.log('Goodbye!');
          process.exit(0);
        default:
          console.log('Invalid choice. Please try again.');
          break;
      }
    }
  }
}

main();