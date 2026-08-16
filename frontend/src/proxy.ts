import { type NextRequest, NextResponse } from 'next/server';
import { intlayerProxy } from 'next-intlayer/proxy';

import {
  buildLocalePath,
  getLocaleFromPath,
  getPathWithoutLocale,
} from '@/utils/locale';

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard'];

// Routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = ['/login', '/register'];

/**
 * Check if user is authenticated by verifying cookie presence
 * TODO: This is a lightweight check - actual validation happens on the backend
 */
function isAuthenticated(request: NextRequest): boolean {
  return request.cookies.has('refreshToken');
}

/**
 * Combined proxy handling both intlayer i18n and auth
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathWithoutLocale = getPathWithoutLocale(pathname);
  const locale = getLocaleFromPath(pathname);
  const authenticated = isAuthenticated(request);

  // Check if route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathWithoutLocale.startsWith(route),
  );

  // Check if route is auth route (login/register)
  const isAuthRoute = AUTH_ROUTES.some((route) =>
    pathWithoutLocale.startsWith(route),
  );

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !authenticated) {
    const loginUrl = new URL(buildLocalePath('/login', locale), request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from auth routes to dashboard
  if (isAuthRoute && authenticated) {
    const dashboardUrl = new URL(
      buildLocalePath('/dashboard', locale),
      request.url,
    );
    return NextResponse.redirect(dashboardUrl);
  }

  // Continue with intlayer proxy for locale handling
  return intlayerProxy(request);
}

export const config = {
  matcher:
    '/((?!api|static|assets|robots|sitemap|sw|service-worker|manifest|.*\\..*|_next).*)',
};
