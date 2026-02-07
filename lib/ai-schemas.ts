import { z } from "zod";

export const rewriteSchema = z.object({
  variations: z.array(
    z.object({
      id: z.string(),
      caption: z.string().max(2200),
      tone: z.enum(["professional", "casual", "empathetic", "inspirational", "educational"])
    })
  ).min(1).max(5) // Allow 1-5 variations instead of exactly 2
});

export const editSchema = z.object({
  caption: z.string().max(2200),
  explanation: z.string()
});

export type RewriteOutput = z.infer<typeof rewriteSchema>;
export type EditOutput = z.infer<typeof editSchema>;
