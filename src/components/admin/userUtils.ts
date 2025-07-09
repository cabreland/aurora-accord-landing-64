export const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case 'admin':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'editor':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'viewer':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

export const getRoleDisplayName = (role: string) => {
  switch (role) {
    case 'admin':
      return 'Administrator';
    case 'editor':
      return 'Manager';
    case 'viewer':
      return 'Investor';
    default:
      return 'User';
  }
};