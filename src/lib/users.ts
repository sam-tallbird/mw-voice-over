import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface User {
  id: string;
  email: string;
  password: string;
  usageCount: number;
  maxUsage: number;
}

// Generate 16-character random passwords
const generatePassword = (length: number = 16): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Hardcoded demo users (initial state)
const INITIAL_DEMO_USERS: User[] = [
  {
    id: 'demo1',
    email: 'demo1@mw.com',
    password: 'A7k$9mX2nP4qW8vZ', // 16 chars
    usageCount: 0,
    maxUsage: 3
  },
  {
    id: 'demo2',
    email: 'demo2@mw.com',
    password: 'B9p#5rY7sL3uE6tR', // 16 chars
    usageCount: 0,
    maxUsage: 3
  },
  {
    id: 'demo3',
    email: 'demo3@mw.com',
    password: 'C4w@8nM1oQ9kI2xV', // 16 chars
    usageCount: 0,
    maxUsage: 3
  },
  {
    id: 'demo4',
    email: 'demo4@mw.com',
    password: 'D6z%3fH5gJ7bN0cF', // 16 chars
    usageCount: 0,
    maxUsage: 3
  },
  {
    id: 'demo5',
    email: 'demo5@mw.com',
    password: 'E8t!1dA4hK6yU9sG', // 16 chars
    usageCount: 0,
    maxUsage: 3
  },
  {
    id: 'demo6',
    email: 'demo6@mw.com',
    password: 'F2m&7vB9jL4wO5pQ', // 16 chars
    usageCount: 0,
    maxUsage: 3
  },
  {
    id: 'demo7',
    email: 'demo7@mw.com',
    password: 'G5x$4cC8kM1zT6rE', // 16 chars
    usageCount: 0,
    maxUsage: 3
  },
  {
    id: 'demo8',
    email: 'demo8@mw.com',
    password: 'H9q#2eD7lN3aS8uY', // 16 chars
    usageCount: 0,
    maxUsage: 3
  },
  {
    id: 'demo9',
    email: 'demo9@mw.com',
    password: 'I3v@6fF0mP5bR1oW', // 16 chars
    usageCount: 0,
    maxUsage: 3
  },
  {
    id: 'demo10',
    email: 'demo10@mw.com',
    password: 'J7y%9gG4nQ8cL2iX', // 16 chars
    usageCount: 0,
    maxUsage: 3
  }
];

// File path for persistent storage
const USERS_FILE_PATH = join(process.cwd(), 'data', 'users.json');

// Ensure data directory exists
const ensureDataDirectory = () => {
  const dataDir = join(process.cwd(), 'data');
  try {
    if (!existsSync(dataDir)) {
      const fs = require('fs');
      fs.mkdirSync(dataDir, { recursive: true });
    }
  } catch (error) {
    console.error('Error creating data directory:', error);
  }
};

// Load users from file or create initial file
const loadUsers = (): User[] => {
  try {
    ensureDataDirectory();
    
    if (existsSync(USERS_FILE_PATH)) {
      const data = readFileSync(USERS_FILE_PATH, 'utf8');
      const users = JSON.parse(data);
      
      // Validate that all initial users exist
      const existingEmails = users.map((u: User) => u.email);
      const missingUsers = INITIAL_DEMO_USERS.filter(
        initialUser => !existingEmails.includes(initialUser.email)
      );
      
      // Add any missing users (in case we add new demo accounts)
      if (missingUsers.length > 0) {
        const updatedUsers = [...users, ...missingUsers];
        saveUsers(updatedUsers);
        return updatedUsers;
      }
      
      return users;
    } else {
      // First time - create file with initial users
      saveUsers(INITIAL_DEMO_USERS);
      return INITIAL_DEMO_USERS;
    }
  } catch (error) {
    console.error('Error loading users:', error);
    // Fallback to initial users
    return INITIAL_DEMO_USERS;
  }
};

// Save users to file
const saveUsers = (users: User[]) => {
  try {
    ensureDataDirectory();
    writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving users:', error);
  }
};

// Get current users (always load from file)
const getUsers = (): User[] => {
  return loadUsers();
};

export const findUserByEmail = (email: string): User | undefined => {
  const users = getUsers();
  return users.find(user => user.email === email);
};

export const validateUser = (email: string, password: string): User | null => {
  const user = findUserByEmail(email);
  if (user && user.password === password) {
    return user;
  }
  return null;
};

export const incrementUsage = (userId: string): boolean => {
  const users = getUsers();
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex !== -1) {
    users[userIndex].usageCount += 1;
    saveUsers(users);
    return true;
  }
  return false;
};

export const canUserGenerate = (userId: string): boolean => {
  const users = getUsers();
  const user = users.find(user => user.id === userId);
  if (!user) return false;
  return user.usageCount < user.maxUsage;
};

export const getUserUsage = (userId: string): { used: number; max: number } | null => {
  const users = getUsers();
  const user = users.find(user => user.id === userId);
  if (!user) return null;
  return { used: user.usageCount, max: user.maxUsage };
};

// Reset all users (for admin purposes - you can call this if needed)
export const resetAllUsage = (): boolean => {
  try {
    const resetUsers = INITIAL_DEMO_USERS.map(user => ({ ...user, usageCount: 0 }));
    saveUsers(resetUsers);
    return true;
  } catch (error) {
    console.error('Error resetting usage:', error);
    return false;
  }
};

// Export passwords for easy reference during demo
export const USER_CREDENTIALS = INITIAL_DEMO_USERS.map(user => ({
  email: user.email,
  password: user.password
})); 