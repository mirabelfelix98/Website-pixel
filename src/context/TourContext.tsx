import React, { createContext, useContext, useEffect, useState } from 'react';
import { driver, Driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useLocation, useNavigate } from 'react-router-dom';
import WelcomeModal from '../components/ui/WelcomeModal';

interface TourContextType {
  startTour: () => void;
  showWelcome: boolean;
  closeWelcome: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [showWelcome, setShowWelcome] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }
  }, []);

  const closeWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  };

  const startTour = () => {
    closeWelcome();
    
    const driverObj = driver({
      showProgress: true,
      animate: true,
      steps: [
        {
          element: '#nav-dashboard',
          popover: {
            title: 'Dashboard',
            description: 'This is your command center. See all your stats and recent activity here.',
            side: 'right',
            align: 'start',
          }
        },
        {
          element: '#nav-add',
          popover: {
            title: 'Add Website',
            description: 'Click here to create a new tracking link for a website.',
            side: 'right',
            align: 'start',
          }
        },
        {
          element: '#nav-library',
          popover: {
            title: 'Website Library',
            description: 'View, manage, and copy links for all your saved websites.',
            side: 'right',
            align: 'start',
          }
        },
        {
          element: '#nav-guide',
          popover: {
            title: 'User Guide',
            description: 'Need help? Access the step-by-step guide and tutorials here.',
            side: 'right',
            align: 'start',
          }
        },
        {
          element: '#stats-overview',
          popover: {
            title: 'Overview Stats',
            description: 'Quickly see how many websites you are tracking and total views across all links.',
            side: 'bottom',
            align: 'start',
          }
        },
        {
          element: '#quick-add-btn',
          popover: {
            title: 'Quick Action',
            description: 'Ready to start? Click here to add your first website.',
            side: 'bottom',
            align: 'end',
          }
        }
      ]
    });

    // If we are not on dashboard, go there first
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        driverObj.drive();
      }, 500);
    } else {
      driverObj.drive();
    }
  };

  return (
    <TourContext.Provider value={{ startTour, showWelcome, closeWelcome }}>
      {children}
      <WelcomeModal 
        isOpen={showWelcome} 
        onClose={closeWelcome} 
        onStartTour={startTour} 
      />
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
}
