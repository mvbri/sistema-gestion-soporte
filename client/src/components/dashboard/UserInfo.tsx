import React from 'react';
import { translateRole } from '../../utils/roleTranslations';
import { User } from '../../types';

interface UserInfoProps {
  user: User | null;
}

export const UserInfo: React.FC<UserInfoProps> = ({ user }) => {
  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Bienvenido, {user?.full_name}
      </h2>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">Email:</p>
          <p className="text-gray-900">{user?.email}</p>
        </div>
        {user?.phone && (
          <div>
            <p className="text-sm text-gray-600">Teléfono:</p>
            <p className="text-gray-900">{user.phone}</p>
          </div>
        )}
        {user?.department && (
          <div>
            <p className="text-sm text-gray-600">Departamento:</p>
            <p className="text-gray-900">{user.department}</p>
          </div>
        )}
        <div>
          <p className="text-sm text-gray-600">Rol:</p>
          <p className="text-gray-900">{translateRole(user?.role)}</p>
        </div>
      </div>
    </>
  );
};
