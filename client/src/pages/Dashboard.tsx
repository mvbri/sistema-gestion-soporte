import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import { UserInfo } from '../components/dashboard/UserInfo';
import { EndUserDashboard } from '../components/dashboard/EndUserDashboard';
import { TechnicianDashboard } from '../components/dashboard/TechnicianDashboard';
import { AdministratorDashboard } from '../components/dashboard/AdministratorDashboard';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const renderRoleDashboard = () => {
    switch (user?.role) {
      case 'end_user':
        return <EndUserDashboard />;
      case 'technician':
        return <TechnicianDashboard />;
      case 'administrator':
        return <AdministratorDashboard />;
      default:
        return null;
    }
  };

  return (
    <>
      <MainNavbar />
      <PageWrapper>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="card">
              <UserInfo user={user} />
              {renderRoleDashboard()}
            </div>
          </div>
        </main>
      </PageWrapper>
    </>
  );
};

