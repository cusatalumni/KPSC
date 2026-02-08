
import React from 'react';
import AdminPageActual from './pages/AdminPage';

// This is a shell for the component to prevent duplicate file build issues.
// The actual logic is moved to components/pages/AdminPage.tsx
const AdminPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    return <AdminPageActual onBack={onBack} />;
};

export default AdminPage;
