import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Everything except Next internals, the API surface, the admin panel
  // (single-language, session-gated), the printable company profile
  // (single-language, rendered to PDF) and files with an extension.
  matcher: ['/((?!api|admin|company-profile|_next|_vercel|.*\\..*).*)'],
}
