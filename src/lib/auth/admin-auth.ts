import { NextRequest } from 'next/server';

export type AdminContext = {
  adminUserId: bigint;
  roles: string[];
};

/**
 * MVP: use header injected by gateway / auth middleware.
 * Production should replace with signed session cookie/JWT verification.
 */
export function requireAdminContext(req: NextRequest): AdminContext {
  const adminUserId = req.headers.get('x-admin-user-id');
  const roles = req.headers.get('x-admin-roles');

  if (!adminUserId) {
    throw new Error('UNAUTHORIZED_ADMIN');
  }

  return {
    adminUserId: BigInt(adminUserId),
    roles: roles ? roles.split(',').map((v) => v.trim()) : [],
  };
}
