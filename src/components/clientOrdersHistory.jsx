import * as React from 'react';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
    Typography, 
    Box, 
    CircularProgress, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Divider 
} from '@mui/material';

// Importa tu configuración de Firebase
import { db } from '../firebase'; 
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

// 🚨 Función para formato de moneda (usada anteriormente)
const formatCOP = (value) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0, 
    }).format(value);
};

export default function ClientOrdersHistory({ clientId, clientName }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!clientId) {
                setOrders([]);
                return;
            }

            setLoading(true);
            setError(null);
            
            try {
                const salesRef = collection(db, "Sale");
                
                // 🚨 CONSULTA: Filtra por el ID del cliente
                const q = query(
                    salesRef,
                    where("clientId", "==", clientId),
                    orderBy("fecha", "desc") 
                );
                
                const querySnapshot = await getDocs(q);
                
                const fetchedOrders = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    const dateObject = new Date(data.fecha); 
                    const deliveryDateObject = data.fechaEntrega ? new Date(data.fechaEntrega) : null;
                    
                    // Asegúrate de usar el campo de valor total correcto
                    const totalOrderValue = parseFloat(data.totalVenta) || 0; 

                    return {
                        id: doc.id,
                        date: dateObject,
                        deliveryDate: deliveryDateObject,
                        total: totalOrderValue, 
                        estadoVenta: data.estadoVenta || 'N/A',
                        estadoPago: data.estadoPago || 'N/A',
                    };
                });

                setOrders(fetchedOrders);

            } catch (err) {
                console.error("Error al obtener el historial de órdenes:", err);
                setError("Error al cargar el historial de pedidos.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [clientId]); 
    
    
    return (
        <Box sx={{ mt: 3 }}>
            <Typography variant="h5" gutterBottom>
                Historial de Pedidos de {clientName}
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                    <Typography sx={{ ml: 2 }}>Cargando historial...</Typography>
                </Box>
            )}

            {error && (
                <Typography color="error" sx={{ my: 4, textAlign: 'center' }}>{error}</Typography>
            )}

            {!loading && !error && orders.length === 0 && (
                <Box sx={{ mt: 3, p: 2, textAlign: 'center', border: '1px dashed #ccc', borderRadius: 1 }}>
                    <Typography color="text.secondary">Este cliente no tiene pedidos registrados.</Typography>
                </Box>
            )}

            {!loading && orders.length > 0 && (
                <TableContainer component={Box}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Fecha del Pedido</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Fecha de Entrega</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Estado Venta</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Estado Pago</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Valor Total</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell>{format(order.date, 'dd/MM/yyyy HH:mm')}</TableCell>
                                    <TableCell>{order.deliveryDate ? format(order.deliveryDate, 'dd/MM/yyyy HH:mm') : 'Pendiente'}</TableCell>
                                    <TableCell>{order.estadoVenta}</TableCell>
                                    <TableCell>{order.estadoPago}</TableCell>
                                    <TableCell align="right">{formatCOP(order.total)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
}