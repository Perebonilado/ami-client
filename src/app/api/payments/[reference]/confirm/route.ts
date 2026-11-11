import { GET } from "../route";

// POST /api/payments/:reference/confirm  The real server re-verifies with the bank here.
// The mock has no bank to ask, so it just returns the payment as it stands.
export const POST = GET;
