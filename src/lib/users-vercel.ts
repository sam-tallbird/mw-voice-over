export interface User {
  id: string;
  email: string;
  password: string;
  usageCount: number;
  maxUsage: number;
}

// Hardcoded demo users (initial state)
const INITIAL_DEMO_USERS: User[] = [
  {
    id: 'demo1',
    email: 'demo1@mw.com',
    password: 'A7k$9mX2nP4qW8vZ',
    usageCount: 0,
    maxUsage: 3
  },
  {
    id: 'demo2',
    email: 'demo2@mw.com',
    password: 'B9p#5rY7sL3uE6tR',
    usageCount: 0,
    maxUsage: 3
  },
  {
    id: 'demo3',
    email: 'demo3@mw.com',
    password: 'C4w@8nM1oQ9kI2xV',
    usageCount: 0,
    maxUsage: 3
  },
  {
    id: 'demo4',
    email: 'demo4@mw.com',
    password: 'D6z%3fH5gJ7bN0cF',
    usageCount: 0,
    maxUsage: 3
  },
  {
    id: 'demo5',
    email: 'demo5@mw.com',
    password: 'E8t!1dA4hK6yU9sG',
    usageCount: 0,
    maxUsage: 3
  },
  {
    id: 'demo6',
    email: 'demo6@mw.com',
    password: 'F2m&7vB9jL4wO5pQ',
    usageCount: 0,
    maxUsage: 3
  },
  {
    id: 'demo7',
    email: 'demo7@mw.com',
    password: 'G5x$4cC8kM1zT6rE',
    usageCount: 0,
    maxUsage: 3
  },
  {
    id: 'demo8',
    email: 'demo8@mw.com',
    password: 'H9q#2eD7lN3aS8uY',
    usageCount: 0,
    maxUsage: 3
  },
  {
    id: 'demo9',
    email: 'demo9@mw.com',
    password: 'I3v@6fF0mP5bR1oW',
    usageCount: 0,
    maxUsage: 3
  },
  {
    id: 'demo10',
    email: 'demo10@mw.com',
    password: 'J7y%9gG4nQ8cL2iX',
    usageCount: 0,
    maxUsage: 3
  }
];

// Load users with usage from environment variables (Vercel-compatible)
const loadUsers = (): User[] => {
  try {
    // Get usage data from environment variable
    const usageData = process.env.USER_USAGE_DATA;
    
    if (usageData) {
      const usageCounts = JSON.parse(usageData);
      
      // Merge usage counts with initial users
      return INITIAL_DEMO_USERS.map(user => ({
        ...user,
        usageCount: usageCounts[user.id] || 0
      }));
    }
    
    // Fallback to initial users
    return INITIAL_DEMO_USERS;
  } catch (error) {
    console.error('Error loading user usage:', error);
    return INITIAL_DEMO_USERS;
  }
};

// Note: In Vercel, we can't persistently save usage data
// This is a limitation of serverless functions
// For production, you'd need a database (see Option 2 below)

export const findUserByEmail = (email: string): User | undefined => {
  const users = loadUsers();
  return users.find(user => user.email === email);
};

export const validateUser = (email: string, password: string): User | null => {
  const user = findUserByEmail(email);
  if (user && user.password === password) {
    return user;
  }
  return null;
};

// These functions won't persist on Vercel without external storage
export const incrementUsage = (userId: string): boolean => {
  console.warn('incrementUsage: Cannot persist usage data on Vercel without database');
  return false; // Indicates no persistent storage
};

export const canUserGenerate = (userId: string): boolean => {
  const users = loadUsers();
  const user = users.find(user => user.id === userId);
  if (!user) return false;
  return user.usageCount < user.maxUsage;
};

export const getUserUsage = (userId: string): { used: number; max: number } | null => {
  const users = loadUsers();
  const user = users.find(user => user.id === userId);
  if (!user) return null;
  return { used: user.usageCount, max: user.maxUsage };
};

export const resetAllUsage = (): boolean => {
  console.warn('resetAllUsage: Cannot reset usage data on Vercel without database');
  return false; // Indicates no persistent storage
};

// Export passwords for easy reference during demo
export const USER_CREDENTIALS = INITIAL_DEMO_USERS.map(user => ({
  email: user.email,
  password: user.password
})); 