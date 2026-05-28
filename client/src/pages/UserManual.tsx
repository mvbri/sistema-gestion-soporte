import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  const sectionIds = useMemo(() => sections.map((s) => s.id), [sections]);
  const [activeSectionId, setActiveSectionId] = useState<string>(() => sections[0]?.id ?? '');

  useEffect(() => {
    setActiveSectionId(sectionIds[0] ?? '');
  }, [selectedRole, sectionIds]);

  useEffect(() => {
    const roleSections = manualSectionsByRole[selectedRole];
    const elements = roleSections
      .map((s) => document.getElementById(sectionAnchorId(selectedRole, s.id)))
      .filter((el): el is HTMLElement => el != null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length === 0) return;

        const fullId = visible[0].target.id;
        const prefix = `${selectedRole}-`;
        if (fullId.startsWith(prefix)) {
          setActiveSectionId(fullId.slice(prefix.length));
        }
      },
      { rootMargin: '-96px 0px -52% 0px', threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [selectedRole, sectionIds]);

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
              className="card manual-toc lg:w-72 flex-shrink-0 lg:sticky lg:top-24 lg:self-start !p-5"
            >
              <div className="manual-toc__header">
                <span className="manual-toc__header-icon" aria-hidden="true">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h7"
                    />
                  </svg>
                </span>
                <span className="manual-toc__header-label">En esta guía</span>
              </div>
              <ul className="manual-toc__list">
                {sections.map((s, index) => {
                  const href = `#${sectionAnchorId(selectedRole, s.id)}`;
                  const isActive = activeSectionId === s.id;
                  return (
                    <li key={s.id}>
                      <a
                        href={href}
                        aria-current={isActive ? 'location' : undefined}
                        className={`manual-toc__link pl-7 ${isActive ? 'manual-toc__link--active' : ''}`}
                      >
                        <span className="manual-toc__index" aria-hidden="true">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="manual-toc__title">{s.title}</span>
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
