export const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: [
    'scenario.read',
    'scenario.write',
    'scenario.publish',
    'link.read',
    'link.write',
    'link.revoke',
    'report.read',
    'report.export',
    'audit.read',
    'admin.manage'
  ],
  ops_admin: ['link.read', 'link.write', 'link.revoke', 'report.read', 'audit.read'],
  content_editor: ['scenario.read', 'scenario.write', 'scenario.publish'],
  analyst: ['report.read', 'audit.read']
};

export function hasPermission(roleCodes: string[], permission: string): boolean {
  return roleCodes.some((role) => ROLE_PERMISSIONS[role]?.includes(permission));
}
