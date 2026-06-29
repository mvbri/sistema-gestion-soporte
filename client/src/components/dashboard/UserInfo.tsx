import React from 'react';
import { translateRole } from '../../utils/roleTranslations';
import { User } from '../../types';

interface UserInfoProps {
  user: User | null;
}

export const UserInfo: React.FC<UserInfoProps> = ({ user }) => {
  return (
    <div className="rounded-2xl p-6 mb-6 border border-sky-400/30 bg-gradient-to-br from-slate-900/70 via-sky-950/50 to-slate-900/70 backdrop-blur-md">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-sm">
            Bienvenido, {user?.full_name}
          </h2>
          <p className="text-blue-100/80">Panel de control</p>
        </div>
        <div className="flex-shrink-0 h-16 w-16 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-900/50 border border-sky-400/40">
          {user?.full_name?.charAt(0).toUpperCase() || 'U'}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl p-4 bg-slate-900/55 border border-sky-400/25 backdrop-blur-sm min-w-0">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-sky-500/25 border border-sky-400/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-sky-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-400 font-medium">Email</p>
              <p className="text-sm font-semibold text-slate-100 break-words">{user?.email || '-'}</p>
            </div>
          </div>
        </div>
        {user?.phone && (
          <div className="rounded-xl p-4 bg-slate-900/55 border border-sky-400/25 backdrop-blur-sm min-w-0">
            <div className="flex items-start gap-3 min-w-0">
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-emerald-500/25 border border-emerald-400/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-400 font-medium">Teléfono</p>
                <p className="text-sm font-semibold text-slate-100 break-words">{user.phone}</p>
              </div>
            </div>
          </div>
        )}
        {user?.department && (
          <div className="rounded-xl p-4 bg-slate-900/55 border border-sky-400/25 backdrop-blur-sm min-w-0">
            <div className="flex items-start gap-3 min-w-0">
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-violet-500/25 border border-violet-400/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-400 font-medium">Dirección</p>
                <p className="text-sm font-semibold text-slate-100 break-words">{user.department}</p>
              </div>
            </div>
          </div>
        )}
        <div className="rounded-xl p-4 bg-slate-900/55 border border-sky-400/25 backdrop-blur-sm min-w-0">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-amber-500/25 border border-amber-400/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-400 font-medium">Rol</p>
              <p className="text-sm font-semibold text-slate-100 break-words">{translateRole(user?.role)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
