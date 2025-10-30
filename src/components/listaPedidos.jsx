import * as React from 'react';
import { useDateFilter } from '../context/dateFilterContext'; 
import { useState, useEffect } from 'react';
import { format, endOfDay, startOfDay } from 'date-fns';
import { 
    Typography, 
    Paper, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Box,
    CircularProgress 
} from '@mui/material';

import { db } from '../firebase'; 
import { 
    collection, 
    query, 
    where, 
    orderBy, 
    getDocs,
    Timestamp 
} from 'firebase/firestore';

const formatCOP = (value) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0,
    }).format(value);
};

export default function OrdersList() {
    const { startDate, endDate } = useDateFilter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Formato de fechas para mostrar en el título
    const formattedDateRange = `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`;

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            setError(null);
            
            // 🚨 CONVERSIÓN DE FECHAS PARA FIRESTORE 🚨
            // Firestore compara Timestamps, no objetos Date nativos de JS directamente en la query
            const startISO = startOfDay(startDate).toISOString();
            const endISO = endOfDay(endDate).toISOString();

            try {
                // 2. CONSTRUYE LA CONSULTA A LA COLECCIÓN "Sale"
                const salesRef = collection(db, "Sale");
                
                const q = query(
                    salesRef,
                    // Filtra por el rango de fechas. 
                    // Asume que el campo en Firestore se llama 'saleDate' y es un Timestamp.
                    where("fecha", ">=", startISO),
                    where("fecha", "<=", endISO),
                    orderBy("fecha", "desc") // Opcional: ordenar por fecha
                );
                
                const querySnapshot = await getDocs(q);
                
                const fetchedOrders = querySnapshot.docs.map(doc => {
                    const data = doc.data();

                    const dateObject = new Date(data.fecha);
                    const totalOrderValue = parseFloat(data.totalVenta) || 0;
                    
                    return {
                        id: doc.id,
                        client: data.clientName || 'Cliente Desconocido',
                        date: dateObject,
                        total: totalOrderValue || 0,
                    };
                });

                setOrders(fetchedOrders);

            } catch (err) {
                console.error("Error al obtener las órdenes:", err);
                setError("Error al cargar los pedidos. Por favor, revisa la conexión y la estructura de la colección 'Sale'.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [startDate, endDate]); // 👈 Dependencia: se ejecuta cada vez que el filtro de fecha cambia
    
    // --- LÓGICA DE RENDERIZADO ---
    
    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Listado de Órdenes
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
                Pedidos en el rango: **{formattedDateRange}**
            </Typography>
            
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                    <Typography sx={{ ml: 2 }}>Cargando pedidos...</Typography>
                </Box>
            )}

            {error && (
                <Box sx={{ my: 4, textAlign: 'center', color: 'error.main' }}>
                    <Typography>{error}</Typography>
                </Box>
            )}

            {!loading && !error && orders.length === 0 && (
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">No se encontraron pedidos en este rango de fechas.</Typography>
                </Box>
            )}

            {!loading && orders.length > 0 && (
                <TableContainer component={Box}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Cliente</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Fecha del Pedido</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Valor Total</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell>{order.client}</TableCell>
                                    <TableCell>{format(order.date, 'dd/MM/yyyy HH:mm')}</TableCell>
                                    <TableCell align="right">
                                        {formatCOP(order.total)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Paper>
    );
}