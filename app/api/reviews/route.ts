import { createServerSupabaseClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/reviews — create a product review.
 *
 * Server-side validation (mirrors the client-side checks in /reviews/new):
 *   - user must be authenticated (user_id comes from the session, never the client)
 *   - product_id required
 *   - rating must be an integer 1-5
 *   - comment required, min 10 characters
 *
 * RLS on the `reviews` table is the final gate; this handler gives friendly
 * error messages and guarantees user_id can't be spoofed by the client.
 */
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  // Auth gate — derive the user from the session cookie, not the request body
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "You must be logged in to submit a review." }, { status: 401 });
  }

  let body: {
    product_id?: string;
    customer_name?: string;
    rating?: number;
    comment?: string;
    category?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const product_id = body.product_id?.trim();
  const customer_name = body.customer_name?.trim();
  const comment = body.comment?.trim();
  const category = body.category?.trim() ?? "";
  const rating = Number(body.rating);

  if (!product_id) {
    return NextResponse.json({ error: "Please select a product." }, { status: 400 });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
  }
  if (!comment || comment.length < 10) {
    return NextResponse.json({ error: "Comment must be at least 10 characters." }, { status: 400 });
  }
  if (!customer_name) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }

  const { error } = await supabase.from("reviews").insert({
    product_id,
    user_id: user.id,
    customer_name,
    rating,
    comment,
    category,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
