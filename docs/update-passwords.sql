-- Update password hashes for demo users
-- Generated from hash-passwords.js script

-- Demo1 user (password: A7k$9mX2nP4qW8vZ)
UPDATE auth.users 
SET password_hash = '$2b$10$YlFlMo2mepRoSFpLpiBfxOzS3ET8CELJw6aGw8ciYLCUCNywLPy1W' 
WHERE email = 'demo1@mw.com';

-- Demo2 user (password: B9p#5rY7sL3uE6tR)
UPDATE auth.users 
SET password_hash = '$2b$10$3q32c21jlE4w8.C8Cs8sSeGcRpVXL2VO5aLUzqnsHjn.EdGHcNz4a' 
WHERE email = 'demo2@mw.com';

-- Demo3 user (password: C4w@8nM1oQ9kI2xV)
UPDATE auth.users 
SET password_hash = '$2b$10$weI50IdHk4ILzDSlt75vl.hYVD/cA16SqGFel0Hezk3VRxw0KEwUG' 
WHERE email = 'demo3@mw.com';

-- Demo4 user (password: D6z%3fH5gJ7bN0cF)
UPDATE auth.users 
SET password_hash = '$2b$10$ttNeWWTQOoZBw5NrcKvhkujqg94lQjD8JyMwunDAotXt5fDUuc6fm' 
WHERE email = 'demo4@mw.com';

-- Demo5 user (password: E8t!1dA4hK6yU9sG)
UPDATE auth.users 
SET password_hash = '$2b$10$JYIMP7jFkh1qbxxWXQ54tuYKpdOSpsDE.f18a0ExrM3/1q93x16Ou' 
WHERE email = 'demo5@mw.com';

-- Demo6 user (password: F2m&7vB9jL4wO5pQ)
UPDATE auth.users 
SET password_hash = '$2b$10$W5BjGNjhRpwz0Xf99EgxpOF4hDcytF48wDabOmNkmOFe.tjXspdOK' 
WHERE email = 'demo6@mw.com';

-- Demo7 user (password: G5x$4cC8kM1zT6rE)
UPDATE auth.users 
SET password_hash = '$2b$10$9jXk9/tiy/b5om94NPU6auGWJi449qH1uC3bH7T8ikc3Fgm/s0tDC' 
WHERE email = 'demo7@mw.com';

-- Demo8 user (password: H9q#2eD7lN3aS8uY)
UPDATE auth.users 
SET password_hash = '$2b$10$SZpHq2zXgL5wb9hBAvLieOlzvzjTJG53rckd46KGPhTBYupXc7NRu' 
WHERE email = 'demo8@mw.com';

-- Demo9 user (password: I3v@6fF0mP5bR1oW)
UPDATE auth.users 
SET password_hash = '$2b$10$rNfewj4mi8pGrAYuH/cth.iJx8Tzp8t18QJjWGAlGI/qUzpzsTpyK' 
WHERE email = 'demo9@mw.com';

-- Demo10 user (password: J7y%9gG4nQ8cL2iX)
UPDATE auth.users 
SET password_hash = '$2b$10$PukqQgD3/E0mxK0km8qCfOwyWGYoXtmx.s.58h/fbWfIBchKUPUbu' 
WHERE email = 'demo10@mw.com';

-- Note: Run this in the Supabase SQL Editor to update the password hashes
-- After running this, users will be able to log in with their original passwords 