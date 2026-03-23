import { type Request, type Response, type NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = (req.session as any).userId;
  if (!userId) {
    res.status(401).json({ error: "unauthorized", message: "Not authenticated" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user || user.role !== "admin") {
    res.status(403).json({ error: "forbidden", message: "Admin access required" });
    return;
  }

  next();
}
