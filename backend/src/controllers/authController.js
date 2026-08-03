import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { signToken } from '../utils/token.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function tokenResponse(user) {
  const token = signToken({ id: user.id, role: user.role });
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

/**
 * Public customer registration — always creates USER.
 * Admin accounts are created only via seed/admin tooling, never via /register.
 * Any `role` in the request body is ignored.
 */
export const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: 'Invalid input', errors: errors.array() });
    return;
  }

  const { name, email, password } = req.body;
  const emailNorm = String(email).toLowerCase().trim();

  const exists = await prisma.user.findUnique({ where: { email: emailNorm } });
  if (exists) {
    res.status(400).json({ message: 'Email already registered' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: emailNorm,
      password: passwordHash,
      role: 'USER',
    },
    select: { id: true, name: true, email: true, role: true },
  });

  res.status(201).json(tokenResponse(user));
});

/**
 * Login for customers and admins (JWT carries numeric user id + role).
 */
export const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: 'Invalid input', errors: errors.array() });
    return;
  }

  const { email, password } = req.body;
  const emailNorm = String(email).toLowerCase().trim();

  const user = await prisma.user.findUnique({ where: { email: emailNorm } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ message: 'Invalid email or password' });
    return;
  }

  const safe = { id: user.id, name: user.name, email: user.email, role: user.role };
  res.json(tokenResponse(safe));
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});
