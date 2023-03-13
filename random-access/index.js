const fs = require('fs');
const path = require('path');

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

// Example usage
(async () => {
  // Create the database file if it doesn't exist
  await createDatabaseFile();

  // Write a new student record to the database
  await writeStudentRecord({ name: 'Rajesh', class: 'B', rollno: 1 });
  await writeStudentRecord({ name: 'Rohan', class: 'A', rollno: 2 });
  await writeStudentRecord({ name: 'Tanuv Nair', class: 'A', rollno: 3 });

  // Read the student record with roll number 1 from the database
  const record = await readStudentRecord(1);
  console.log(record); // { name: 'Rajesh', class: 'A', rollno: 1 }

  const record2 = await readStudentRecord(2);
  console.log(record2); 

  const record3 = await readStudentRecord(3);
  console.log(record3); 
})();
