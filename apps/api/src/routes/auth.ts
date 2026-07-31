import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { AppError } from "../middleware/errorHandler.js";
import { requireAuth, AuthRequest } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";
const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function signToken(user: { id: string; email: string; role: string }) {
  const opts: jwt.SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"],
  };
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET!,
    opts
  );
}

router.post("/register", async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: data.email }, { username: data.username }] },
    });
    if (existing) throw new AppError("Email or username already taken", 409);

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        passwordHash,
        referralCode: `AX${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      },
    });

    const token = signToken(user);
    res.status(201).json({
      success: true,
      token,
      user: { id: user.id, email: user.email, username: user.username, role: user.role },
    });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user || !user.passwordHash) throw new AppError("Invalid credentials", 401);

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) throw new AppError("Invalid credentials", 401);

    const token = signToken(user);
    res.json({
      success: true,
      token,
      user: { id: user.id, email: user.email, username: user.username, role: user.role },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/me", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        role: true,
        walletBalance: true,
        referralCode: true,
        createdAt: true,
      },
    });
    if (!user) throw new AppError("User not found", 404);
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
});

export { router as authRoutes };
