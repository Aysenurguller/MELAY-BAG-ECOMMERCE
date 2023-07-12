import bcrypt from 'bcryptjs';

const users = [
  {
    name: 'Admin',
    email: 'admin@example.com',
    password: bcrypt.hashSync('123456', 10),
    isAdmin: true,
  },
  {
    name: 'User',
    email: 'user@example.com',
    password: bcrypt.hashSync('123456', 10),
  },
  {
    name: 'User2',
    email: 'user2@example.com',
    password: bcrypt.hashSync('123456', 10),
  },
  {
    name: 'admin14',
    email: 'admin14@example.com',
    password: bcrypt.hashSync('admin', 10),
    isAdmin: true,
  },
  {
    name: 'seller',
    email: 'selller@example.com',
    password: bcrypt.hashSync('seller', 10),
    isSeller: true,
  },
];

export default users;
