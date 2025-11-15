export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    status: "ok",
    worker: "listening",
    timestamp: new Date().toISOString(),
  });
}
