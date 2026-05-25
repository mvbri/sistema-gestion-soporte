import { ReactNode } from 'react';
import { useMenu } from '../contexts/MenuContext';

interface PageWrapperProps {
  children: ReactNode;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({ children }) => {
  const { menuOpen } = useMenu();

  return (
    <div className="app-shell min-h-screen pt-16 overflow-x-hidden">
      <div
        className={`relative z-10 transition-all duration-300 ease-in-out ${
          menuOpen
            ? 'md:ml-80 md:w-[calc(100%-20rem)]'
            : 'md:ml-0 md:w-full'
        }`}
      >
        {children}
      </div>
    </div>
  );
};
