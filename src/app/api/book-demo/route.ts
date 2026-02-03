import { NextResponse } from "next/server";

// Simple email sender using Resend HTTP API.
// Configure these env vars in your deployment:
// - RESEND_API_KEY: your Resend API key
// - BOOK_DEMO_ADMIN_EMAIL: where demo requests should be sent
// - BOOK_DEMO_FROM_EMAIL (optional): from address, defaults to noreply@projectgumpo.space

interface BookDemoPayload {
  audience: "school" | "parent";
  name: string;
  email: string;
  phone: string;
  school?: string;
}

export async function POST(request: Request) {
  let payload: BookDemoPayload;

  try {
    payload = (await request.json()) as BookDemoPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { audience, name, email, phone, school } = payload;

  if (!name || !email || !phone) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.BOOK_DEMO_ADMIN_EMAIL ?? "burfix@gmail.com";
  const fromEmail =
    process.env.BOOK_DEMO_FROM_EMAIL ?? "Project Goose <noreply@projectgumpo.space>";

  if (!apiKey || !adminEmail) {
    return NextResponse.json(
      { error: "Email not configured on server" },
      { status: 500 },
    );
  }

  const subjectPrefix = audience === "school" ? "New school demo request" : "New parent walkthrough request";

  const html = `
    <h1>${subjectPrefix}</h1>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Audience:</strong> ${audience === "school" ? "Pre-School / Daycare" : "Parent / Caregiver"}</p>
    ${school ? `<p><strong>School / Center:</strong> ${school}</p>` : ""}
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: adminEmail,
      subject: subjectPrefix,
      html,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return NextResponse.json(
      { error: "Failed to send email", providerError: text || undefined },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
