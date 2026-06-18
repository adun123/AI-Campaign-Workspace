import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, password, full_name } = await request.json();

  if (!email || !password || !full_name) {
    return NextResponse.json({ error: "Email, password, dan nama wajib diisi." }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const userId = data.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Gagal membuat user." }, { status: 500 });
  }

  // Buat profile
  const { error: profileError } = await supabase
    .from("profiles")
    .insert({ id: userId, full_name });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  // Auto-create workspace
  const { error: wsError } = await supabase
    .from("workspaces")
    .insert({ owner_id: userId, name: `${full_name}'s Workspace`, plan: "starter" });

  if (wsError) {
    return NextResponse.json({ error: wsError.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Registrasi berhasil. Cek email untuk verifikasi." }, { status: 201 });
}
