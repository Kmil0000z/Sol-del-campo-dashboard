import * as React from 'react';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
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
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { DateFilterProvider } from '../context/dateFilterContext';
import DateFilter from './dateFilter';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../context/authContext';

// Importa tu componente ya creado
import TotalVendidoCard from './totalVendidoMes';
import TopVentasList from './topVentasList';
import TopMenosVendidoList from './topMenosVendidos';
import ClienteDelMes from './clienteDelMes';
import OrdersList from './listaPedidos';
import ClientSearch from './clientSearch';

// --- Configuración de Drawer y AppBar ---
const drawerWidth = 240;

// Definición de AppBar (Se deja por si se quiere añadir una barra superior en el futuro)
const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    // ... estilos del AppBar (se mantiene, aunque no lo usemos, por si se necesita)
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        '& .MuiDrawer-paper': {
            backgroundColor: '#263238', // Fondo oscuro
            color: 'white',              // Letras blancas
            position: 'relative',
            whiteSpace: 'nowrap',
            width: drawerWidth,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
            boxSizing: 'border-box',
            ...(!open && {
                overflowX: 'hidden',
                transition: theme.transitions.create('width', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
                width: theme.spacing(7),
                [theme.breakpoints.up('sm')]: {
                    width: theme.spacing(9),
                },
            }),
        },
    }),
);

// Tema por defecto de MUI
const defaultTheme = createTheme();

function MainContent({ currentView }) {

    if (currentView === 'orders') {
        return (
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <OrdersList />
                </Grid>
            </Grid>
        );
    }

    if (currentView === 'clients') {
        return (
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <ClientSearch />
                </Grid>
            </Grid>
        );
    }

    // Vista por defecto: Dashboard (Métricas y Tarjetas)
    return (
        <Grid container spacing={3}>
            {/* Total Vendido */}
            <Grid item xs={12} md={6} lg={4}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <TotalVendidoCard />
                </Paper>
            </Grid>

            {/* Cliente del Mes */}
            <Grid item xs={12} md={6} lg={4}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <ClienteDelMes />
                </Paper>
            </Grid>

            {/* Top 5 Más Vendidos */}
            <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
                    <TopVentasList />
                </Paper>
            </Grid>

            {/* Top 5 Menos Vendidos */}
            <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
                    <TopMenosVendidoList />
                </Paper>
            </Grid>
        </Grid>
    );
}

function DashboardContent() {
    const { logout } = useAuth();

    const [open, setOpen] = React.useState(true);

    const [currentView, setCurrentView] = React.useState('dashboard');
    const toggleDrawer = () => {
        setOpen(!open);
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            <DateFilterProvider> {/* 👈 Contexto de Fechas para todo el contenido */}
                <Box sx={{ display: 'flex' }}>
                    <CssBaseline />

                    {/* 🚨 DRAWER (Menú Lateral) */}
                    <Drawer variant="permanent" open={open}>
                        <Toolbar
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                px: [1],
                            }}
                        >
                            {/* Título condicional */}
                            <Typography
                                variant="h6"
                                component="div"
                                sx={{
                                    flexGrow: 1,
                                    ml: 1,
                                    display: open ? 'block' : 'none' // Oculta al cerrar
                                }}
                            >
                                Dashboard
                            </Typography>
                            {/* Botón de Abrir/Cerrar condicional */}
                            <IconButton onClick={toggleDrawer}>
                                {open ? (
                                    <ChevronLeftIcon sx={{ color: 'white' }} /> // Flecha izquierda (Cerrar)
                                ) : (
                                    <ChevronRightIcon sx={{ color: 'white' }} /> // Flecha derecha (Abrir)
                                )}
                            </IconButton>
                        </Toolbar>
                        <Divider />

                        {/* Lista de Navegación */}
                        <List component="nav">
                            {/* Elemento Dashboard */}
                            <ListItemButton onClick={() => setCurrentView('dashboard')}>
                                <ListItemIcon>
                                    <DashboardIcon sx={{ color: 'white' }} />
                                </ListItemIcon>
                                <ListItemText primary="Dashboard" />
                            </ListItemButton>

                            {/* Elemento Órdenes */}
                            <ListItemButton onClick={() => setCurrentView('orders')}>
                                <ListItemIcon>
                                    <ShoppingCartIcon sx={{ color: 'white' }} />
                                </ListItemIcon>
                                <ListItemText primary="Órdenes" />
                            </ListItemButton>

                            <ListItemButton onClick={() => setCurrentView('clients')}>
                                <ListItemIcon>
                                    <PeopleIcon sx={{ color: 'white' }} />
                                </ListItemIcon>
                                <ListItemText primary="Clientes" />
                            </ListItemButton>
                            <Divider sx={{ my: 1 }} />
                            <ListItemButton onClick={logout}>
                                <ListItemIcon>
                                    <LogoutIcon sx={{ color: 'white' }} />
                                </ListItemIcon>
                                <ListItemText primary="Cerrar Sesión" />
                            </ListItemButton>
                        </List>
                    </Drawer>

                    {/* 🚨 CONTENIDO PRINCIPAL */}
                    <Box
                        component="main"
                        sx={{
                            backgroundColor: (theme) =>
                                theme.palette.mode === 'light'
                                    ? theme.palette.grey[100]
                                    : theme.palette.grey[900],
                            flexGrow: 1,
                            height: '100vh',
                            overflow: 'auto',
                            // Usamos padding para asegurar que el contenido empiece correctamente
                            pt: 3,
                            pl: open ? { xs: 1, sm: 3 } : { xs: 1, sm: 3 },
                            pr: 3
                        }}
                    >
                        {/* La línea <Toolbar /> ya no es necesaria, el pt: 3 y la ausencia del AppBar lo compensan */}

                        <Container maxWidth="xl" sx={{ mt: 1, mb: 4 }}>

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