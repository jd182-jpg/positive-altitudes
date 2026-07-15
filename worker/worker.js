// Positive Altitudes — Square donation payment Worker
// -----------------------------------------------------
// This tiny server receives a one-time card token from the website,
// then charges it through Square using your secret access token.
// The website never sees your access token; it only lives here.
//
// Environment variables to set in the Cloudflare dashboard
// (Settings -> Variables and Secrets):
//   SQUARE_ACCESS_TOKEN  (Secret)    -> your Square access token
//   SQUARE_LOCATION_ID   (Plaintext) -> your Square location ID
//   SQUARE_ENV           (Plaintext) -> "production" (or "sandbox" for testing)
//   ALLOWED_ORIGIN       (Plaintext) -> https://positivealtitudes.org

const DEFAULT_ORIGIN = "https://positivealtitudes.org";

function cors(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function json(obj, status, headers) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

export default {
  async fetch(request, env) {
    const allowed = env.ALLOWED_ORIGIN || DEFAULT_ORIGIN;
    const headers = cors(allowed);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }
    if (request.method !== "POST") {
      return json({ error: "Method not allowed." }, 405, headers);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid request." }, 400, headers);
    }

    const sourceId = body && body.sourceId;
    const cents = Math.round(Number(body && body.amount) * 100);
    if (!sourceId || !Number.isFinite(cents) || cents < 100) {
      return json({ error: "Please enter an amount of at least $1." }, 400, headers);
    }
    if (cents > 10000000) {
      return json({ error: "That amount is too large. Contact us directly for major gifts." }, 400, headers);
    }

    const base =
      env.SQUARE_ENV === "sandbox"
        ? "https://connect.squareupsandbox.com"
        : "https://connect.squareup.com";

    let resp, data;
    try {
      resp = await fetch(`${base}/v2/payments`, {
        method: "POST",
        headers: {
          "Square-Version": "2024-10-17",
          Authorization: `Bearer ${env.SQUARE_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idempotency_key: crypto.randomUUID(),
          source_id: sourceId,
          location_id: env.SQUARE_LOCATION_ID,
          amount_money: { amount: cents, currency: "USD" },
          note: "Donation via positivealtitudes.org",
        }),
      });
      data = await resp.json();
    } catch (e) {
      return json({ error: "Could not reach the payment processor. Please try again." }, 502, headers);
    }

    if (!resp.ok) {
      const detail =
        (data.errors && data.errors[0] && data.errors[0].detail) ||
        "Your payment could not be processed. Please try again.";
      return json({ error: detail }, 400, headers);
    }

    return json(
      { ok: true, status: data.payment && data.payment.status, id: data.payment && data.payment.id },
      200,
      headers
    );
  },
};
