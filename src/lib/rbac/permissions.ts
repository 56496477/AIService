const rolePermissionMap: Record<string, string[]> = {
  super_admin: ['*'],
  ops_admin: ['link.read', 'link.write', 'link.revoke', 'report.read', 'audit.read'],
  content_editor: ['scenario.read', 'scenario.write', 'scenario.publish'],
  analyst: ['report.read', 'audit.read', 'scenario.read', 'link.read'],
};

export function hasPermission(roles: string[], requiredPermission: string): boolean {
  return roles.some((role) => {
    const permissions = rolePermissionMap[role] || [];
    return permissions.includes('*') || permissions.includes(requiredPermission);
  });
}

export function assertPermission(roles: string[], requiredPermission: string): void {
  if (!hasPermission(roles, requiredPermission)) {
    throw new Error(`FORBIDDEN:${requiredPermission}`);
  }
}
