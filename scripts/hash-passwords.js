// This script generates bcrypt hashes for the demo user passwords
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

// Demo users from the current system
const demoUsers = [
  { id: 'demo1', email: 'demo1@mw.com', password: 'A7k$9mX2nP4qW8vZ' },
  { id: 'demo2', email: 'demo2@mw.com', password: 'B9p#5rY7sL3uE6tR' },
  { id: 'demo3', email: 'demo3@mw.com', password: 'C4w@8nM1oQ9kI2xV' },
  { id: 'demo4', email: 'demo4@mw.com', password: 'D6z%3fH5gJ7bN0cF' },
  { id: 'demo5', email: 'demo5@mw.com', password: 'E8t!1dA4hK6yU9sG' },
  { id: 'demo6', email: 'demo6@mw.com', password: 'F2m&7vB9jL4wO5pQ' },
  { id: 'demo7', email: 'demo7@mw.com', password: 'G5x$4cC8kM1zT6rE' },
  { id: 'demo8', email: 'demo8@mw.com', password: 'H9q#2eD7lN3aS8uY' },
  { id: 'demo9', email: 'demo9@mw.com', password: 'I3v@6fF0mP5bR1oW' },
  { id: 'demo10', email: 'demo10@mw.com', password: 'J7y%9gG4nQ8cL2iX' }
];

async function hashPasswords() {
  console.log('Generating password hashes for demo users...');
  console.log('----------------------------------------');
  
  // SQL statements for updating the users
  const sqlStatements = [];
  
  // Generate hashes for each user
  for (const user of demoUsers) {
    try {
      const hash = await bcrypt.hash(user.password, SALT_ROUNDS);
      console.log(`${user.id} (${user.email}):`);
      console.log(`  Password: ${user.password}`);
      console.log(`  Hash: ${hash}`);
      console.log('');
      
      // Generate SQL update statement
      sqlStatements.push(`UPDATE auth.users SET password_hash = '${hash}' WHERE email = '${user.email}';`);
    } catch (error) {
      console.error(`Error hashing password for ${user.email}:`, error);
    }
  }
  
  console.log('----------------------------------------');
  console.log('SQL UPDATE statements:');
  console.log('');
  
  // Print all SQL statements
  sqlStatements.forEach(sql => console.log(sql));
  
  console.log('');
  console.log('Run these statements in your Supabase SQL editor to update the password hashes.');
}

hashPasswords().catch(console.error); 