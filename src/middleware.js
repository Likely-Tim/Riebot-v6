import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';

export default withMiddlewareAuthRequired();

export const config = {
  matcher: ['/((?!_next|static|public|favicon.ico|api/auth/me).+)']
};
