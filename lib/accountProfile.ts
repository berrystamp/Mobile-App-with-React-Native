/** Select a profile without falling back to a different account role. */
export function getAccountProfile(user: any, role: string): any {
  const normalized = role.toUpperCase();
  const key = normalized === 'PRINTER' ? 'printerProfile' :
    normalized === 'DESIGNER' ? 'designerProfile' : 'customerProfile';
  if (user?.[key]) return user[key];
  if (String(user?.profileType || '').toUpperCase() === normalized &&
      !user?.customerProfile && !user?.designerProfile && !user?.printerProfile) return user;
  return null;
}
