// Readiness probe for Kubernetes (the sandbox expects GET /healthz to return 200).
export function GET() {
  return Response.json({ status: "ok" });
}
