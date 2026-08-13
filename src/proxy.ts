import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/definir-senha"];
const PUBLIC_ACCOUNT_PATHS = ["/conta"];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublicAdminPath = PUBLIC_ADMIN_PATHS.some((p) => path.startsWith(p));

  if (path.startsWith("/admin") && !isPublicAdminPath) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", path);
      return NextResponse.redirect(url);
    }

    const { data: adminRow } = await supabase
      .from("admin_users")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!adminRow) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", path);
      return NextResponse.redirect(url);
    }
  }

  if (path.startsWith("/conta") && !PUBLIC_ACCOUNT_PATHS.includes(path) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/conta";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/conta/:path*"],
};
