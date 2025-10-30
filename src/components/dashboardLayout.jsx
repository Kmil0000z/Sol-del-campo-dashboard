import * as React from 'react';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { DateFilterProvider } from '../context/dateFilterContext';
import DateFilter from './dateFilter';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../context/authContext';

// Importa tus componentes
import TotalVendidoCard from './totalVendidoMes';
import TopVentasList from './topVentasList';
import TopMenosVendidoList from './topMenosVendidos';
import ClienteDelMes from './clienteDelMes';
import OrdersList from './listaPedidos';
import ClientSearch from './clientSearch';

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme }) => ({
    backgroundColor: '#fff',
    boxShadow: 'none',
    borderBottom: '1px solid #e0e0e0',
    color: theme.palette.text.primary,
}));

// Drawer permanente para desktop
const PermanentDrawer = styled(MuiDrawer)(({ theme }) => ({
    '& .MuiDrawer-paper': {
        backgroundColor: '#263238',
        color: 'white',
        position: 'relative',
        whiteSpace: 'nowrap',
        width: drawerWidth,
        minHeight: '100vh',
        boxSizing: 'border-box',
    },
}));

const defaultTheme = createTheme();

function MainContent({ currentView }) {
    if (currentView === 'orders') {
        return <OrdersList />;
    }

    if (currentView === 'clients') {
        return <ClientSearch />;
    }

    // Vista por defecto: Dashboard
    return (
        <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={6} lg={3}>
                <TotalVendidoCard />
            </Grid>

            <Grid item xs={12} sm={6} md={6} lg={3}>
                <ClienteDelMes />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={3}>
                <TopVentasList />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={3}>
                <TopMenosVendidoList />
            </Grid>
        </Grid>
    );
}

// Contenido del Drawer (reutilizable)
function DrawerContent({ currentView, setCurrentView, logout, onItemClick }) {
    return (
        <>
            <Toolbar
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    px: [1],
                    minHeight: '64px',
                }}
            >
                <Typography variant="h6" noWrap component="div">
                    Mi Dashboard
                </Typography>
            </Toolbar>
            <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />

            <List component="nav">
                <ListItemButton
                    onClick={() => {
                        setCurrentView('dashboard');
                        onItemClick?.();
                    }}
                    selected={currentView === 'dashboard'}
                >
                    <ListItemIcon sx={{ color: 'white' }}>
                        <DashboardIcon />
                    </ListItemIcon>
                    <ListItemText primary="Dashboard" />
                </ListItemButton>

                <ListItemButton
                    onClick={() => {
                        setCurrentView('orders');
                        onItemClick?.();
                    }}
                    selected={currentView === 'orders'}
                >
                    <ListItemIcon sx={{ color: 'white' }}>
                        <ShoppingCartIcon />
                    </ListItemIcon>
                    <ListItemText primary="Ordenes" />
                </ListItemButton>

                <ListItemButton
                    onClick={() => {
                        setCurrentView('clients');
                        onItemClick?.();
                    }}
                    selected={currentView === 'clients'}
                >
                    <ListItemIcon sx={{ color: 'white' }}>
                        <PeopleIcon />
                    </ListItemIcon>
                    <ListItemText primary="Clientes" />
                </ListItemButton>

                <Divider sx={{ my: 1, backgroundColor: 'rgba(255,255,255,0.2)' }} />

                <ListItemButton onClick={logout}>
                    <ListItemIcon sx={{ color: 'white' }}>
                        <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText primary="Cerrar Sesión" />
                </ListItemButton>
            </List>
        </>
    );
}

function DashboardContent() {
    const { logout } = useAuth();
    const [currentView, setCurrentView] = React.useState('dashboard');
    const isDesktop = useMediaQuery(defaultTheme.breakpoints.up('md'));
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            <DateFilterProvider>
                <Box sx={{ display: 'flex' }}>
                    <CssBaseline />

                    {/* AppBar para móvil */}
                    {!isDesktop && (
                        <AppBar position="fixed">
                            <Toolbar>
                                <IconButton
                                    color="inherit"
                                    aria-label="open drawer"
                                    onClick={handleDrawerToggle}
                                    edge="start"
                                >
                                    <MenuIcon />
                                </IconButton>
                                <Typography variant="h6" noWrap component="div">
                                    Menú
                                </Typography>
                            </Toolbar>
                        </AppBar>
                    )}

                    {/* Drawer temporal para móvil */}
                    {!isDesktop && (
                        <MuiDrawer
                            variant="temporary"
                            open={mobileOpen}
                            onClose={handleDrawerToggle}
                            ModalProps={{
                                keepMounted: true, // Mejor performance en móvil
                            }}
                            sx={{
                                '& .MuiDrawer-paper': {
                                    backgroundColor: '#263238',
                                    color: 'white',
                                    width: drawerWidth,
                                    boxSizing: 'border-box',
                                },
                            }}
                        >
                            <DrawerContent
                                currentView={currentView}
                                setCurrentView={setCurrentView}
                                logout={logout}
                                onItemClick={handleDrawerToggle}
                            />
                        </MuiDrawer>
                    )}

                    {/* Drawer permanente para desktop */}
                    {isDesktop && (
                        <PermanentDrawer variant="permanent">
                            <DrawerContent
                                currentView={currentView}
                                setCurrentView={setCurrentView}
                                logout={logout}
                            />
                        </PermanentDrawer>
                    )}

                    {/* CONTENIDO PRINCIPAL */}
                    <Box
                        component="main"
                        sx={{
                            backgroundColor: (theme) =>
                                theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900],
                            flexGrow: 1,
                            minHeight: '100vh',
                            overflow: 'auto',
                            pt: { xs: '64px', md: 0 }, // padding-top para el AppBar en móvil
                            width: '100%',
                        }}
                    >
                        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3 } }}>
                            {currentView === 'dashboard' && <DateFilter />}
                            <MainContent currentView={currentView} />
                        </Container>
                    </Box>
                </Box>
            </DateFilterProvider>
        </ThemeProvider>
    );
}

export default function DashboardLayout() {
    return <DashboardContent />;
}