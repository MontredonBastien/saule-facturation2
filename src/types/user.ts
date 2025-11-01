export type AccessLevel = 'all' | 'team' | 'own' | 'none';

export type ModuleName =
  | 'dashboard'
  | 'quotes'
  | 'invoices'
  | 'credits'
  | 'articles'
  | 'clients'
  | 'equipment'
  | 'rentals'
  | 'settings'
  | 'emails'
  | 'users';

export type ActionName =
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'validate'
  | 'manage_payments'
  | 'send';

export interface Role {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  is_system: boolean;
  created_at: Date;
}

export interface Permission {
  id: string;
  module: ModuleName;
  action: ActionName;
  display_name: string;
  description?: string;
  created_at: Date;
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  access_level: AccessLevel;
  created_at: Date;
  permission?: Permission;
}

export interface UserCustomPermission {
  id: string;
  user_id: string;
  permission_id: string;
  access_level: AccessLevel;
  created_at: Date;
  permission?: Permission;
}

export interface AppUser {
  id: string;
  auth_user_id?: string;
  email: string;
  full_name: string;
  role_id?: string;
  role?: Role;
  is_active: boolean;
  created_at: Date;
  created_by?: string;
  last_login?: Date;
  notes?: string;
  custom_permissions?: UserCustomPermission[];
}

export interface UserPermissionCheck {
  module: ModuleName;
  action: ActionName;
  accessLevel: AccessLevel;
}

export interface PermissionMatrix {
  [module: string]: {
    [action: string]: AccessLevel;
  };
}
