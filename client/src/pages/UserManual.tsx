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
        <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <header className="mb-8">
            <h1 className="page-heading">Manual de usuario</h1>
            <p className="page-subheading max-w-3xl">
              Guía de uso según el rol. La pestaña inicial coincide con tu cuenta; podés cambiar de rol
              para consultar otras guías.
            </p>
          </header>

          <div
            className="flex flex-wrap gap-2 mb-8 p-1.5 rounded-2xl bg-slate-950/55 backdrop-blur-md border border-sky-400/30 shadow-lg shadow-sky-950/30"
            role="tablist"
            aria-label="Rol del manual"
          >
            {manualRolesOrdered.map((role) => (
              <button
                key={role}
                type="button"
                role="tab"
                aria-selected={selectedRole === role}
                className={`flex-1 min-w-[8.5rem] px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  selectedRole === role
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-blue-900/40 ring-1 ring-sky-300/50'
                    : 'text-blue-50/90 hover:text-white hover:bg-slate-800/55'
                }`}
                onClick={() => setSelectedRole(role)}
              >
                {manualRoleLabels[role]}
              </button>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            <nav
              aria-label="Contenido del manual"
              className="card lg:w-64 flex-shrink-0 lg:sticky lg:top-24 lg:self-start !p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-sky-300/90 mb-4">
                En esta guía
              </p>
              <ul className="space-y-0.5 border-l-2 border-sky-400/40 pl-4">
                {sections.map((s) => {
                  const href = `#${sectionAnchorId(selectedRole, s.id)}`;
                  return (
                    <li key={s.id}>
                      <a
                        href={href}
                        className="group block py-2 pl-2 -ml-0.5 rounded-r-lg text-sm text-blue-50/90 hover:text-white hover:bg-sky-500/15 border-l-2 border-transparent hover:border-sky-400 transition-colors"
                      >
                        <span className="group-hover:underline underline-offset-2 decoration-sky-300/70">
                          {s.title}
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="card min-w-0 flex-1 !p-6 sm:!p-8">
              <div className="space-y-12">
                {sections.map((section) => (
                  <section
                    key={section.id}
                    id={sectionAnchorId(selectedRole, section.id)}
                    className="scroll-mt-28 rounded-xl -mx-2 px-4 py-3 transition-colors target:bg-sky-500/10 target:ring-1 target:ring-sky-400/35"
                    aria-labelledby={`heading-${selectedRole}-${section.id}`}
                  >
                    <h2
                      id={`heading-${selectedRole}-${section.id}`}
                      className="text-xl font-semibold text-white border-b border-sky-400/30 pb-3 mb-4"
                    >
                      {section.title}
                    </h2>
                    <div className="space-y-4 text-blue-50/90 text-base leading-relaxed">
                      {section.paragraphs.map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    </>
  );
};
