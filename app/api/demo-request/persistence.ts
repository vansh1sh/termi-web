import type { DemoRequest } from "./validation";

type InsertResult = PromiseLike<{ error: { message?: string } | null }>;

export type DemoRequestClient = {
  from: (table: string) => {
    insert: (row: Record<string, string | null>) => InsertResult;
  };
};

export async function insertDemoRequest(client: DemoRequestClient, request: DemoRequest): Promise<void> {
  const row = {
    email: request.email,
    phone: request.phone || null,
    details: request.details || null,
    source: "termi-web",
  };
  const { error } = await client.from("demo_requests").insert(row);
  if (error) throw new Error("Unable to save demo request");
}
