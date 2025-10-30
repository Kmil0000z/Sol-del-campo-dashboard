import * as React from 'react';
import './App.css';
import DashboardLayout from './components/dashboardLayout';
import Login from './components/login';
import { AuthProvider, useAuth } from './context/authContext';

import { Box, CircularProgress } from '@mui/material';

function AppRouter() {
    const { user, loading } = useAuth();

    if (loading) {
        // Muestra un loader mientras Firebase verifica la sesión
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress size={60} />
            </Box>
        );
    }
    
    // Si hay un usuario, muestra el Dashboard. Si no, muestra el Login.
    return user ? <DashboardLayout /> : <Login />;
}

export default function App() {
    return (
        // Envuelve la aplicación con el proveedor de autenticación
        <AuthProvider> 
            <AppRouter />
        </AuthProvider>
    );
}