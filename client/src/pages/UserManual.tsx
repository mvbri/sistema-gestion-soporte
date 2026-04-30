import React, { useEffect, useRef, useState } from 'react';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import { useAuth } from '../hooks/useAuth';
import {
  manualRoleLabels,
  manualRolesOrdered,
  manualSectionsByRole,
} from '../content/userManual';
import type { ManualUserRole } from '../content/userManual';

function sectionAnchorId(role: ManualUserRole, sectionId: string): string {
  return `${role}-${sectionId}`;
}

export const UserManual: React.FC = () => {
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<ManualUserRole>('end_user');
  const syncedDefaultRole = useRef(false);

  useEffect(() => {
    if (user?.role && !syncedDefaultRole.current) {
      setSelectedRole(user.role);
      syncedDefaultRole.current = true;
    }
  }, [user?.role]);

  const sections = manualSectionsByRole[selectedRole];

  return (
    <>
      <MainNavbar />
      <PageWrapper>
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <header className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manual de usuario</h1>
            <p className="mt-2 text-gray-600 text-base">
              Guía de uso según el rol. La pestaña inicial coincide con tu cuenta; podés cambiar de rol
              para consultar otras guías.
            </p>
          </header>

          <div
            className="flex flex-wrap gap-2 mb-8 p-1 bg-gray-200/80 rounded-lg"
            role="tablist"
            aria-label="Rol del manual"
          >
            {manualRolesOrdered.map((role) => (
              <button
                key={role}
                type="button"
                role="tab"
                aria-selected={selectedRole === role}
                className={`flex-1 min-w-[8.5rem] px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  selectedRole === role
                    ? 'bg-white text-blue-800 shadow-sm ring-1 ring-gray-200'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100/80'
                }`}
                onClick={() => setSelectedRole(role)}
              >
                {manualRoleLabels[role]}
              </button>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
            <nav
              aria-label="Contenido del manual"
              className="lg:w-56 flex-shrink-0 lg:sticky lg:top-24 lg:self-start"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
                En esta guía
              </p>
              <ul className="space-y-1.5 border-l-2 border-blue-200 pl-3">
                {sections.map((s) => {
                  const href = `#${sectionAnchorId(selectedRole, s.id)}`;
                  return (
                    <li key={s.id}>
                      <a
                        href={href}
                        className="text-sm text-blue-700 hover:text-blue-900 hover:underline"
                      >
                        {s.title}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="min-w-0 flex-1 space-y-10">
              {sections.map((section) => (
                <section
                  key={section.id}
                  id={sectionAnchorId(selectedRole, section.id)}
                  className="scroll-mt-24"
                  aria-labelledby={`heading-${selectedRole}-${section.id}`}
                >
                  <h2
                    id={`heading-${selectedRole}-${section.id}`}
                    className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4"
                  >
                    {section.title}
                  </h2>
                  <div className="space-y-3 text-gray-700 text-base leading-relaxed">
                    {section.paragraphs.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </PageWrapper>
    </>
  );
};
