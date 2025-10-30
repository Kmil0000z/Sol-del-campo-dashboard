import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, CircularProgress, Avatar } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useDateFilter } from '../context/dateFilterContext';
import { db } from '../firebase';

function ClienteDelMes() {
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const { startDate, endDate } = useDateFilter();

  const getInitials = (name) => {
    if (!name) return 'C';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {

        const startString = startDate.toISOString();
        const endString = endDate.toISOString();

        // 1. Consulta: Órdenes dentro del mes en curso
        const q = query(
          collection(db, "Sale"), 
          where("fecha", ">=", startString),
          where("fecha", "<=", endString)
        );

        const snapshot = await getDocs(q);
        const valorVendidoPorCliente = {}; // Objeto para acumular el valor monetario
        
        // 2. Procesar: Agrupar por cliente y sumar el valor de los productos
        snapshot.forEach(doc => {
          const order = doc.data();
          const clientId = order.clientId; 
          const clientName = order.clientName || 'Cliente Desconocido';
          let ordenTotalValor = 0; // Valor total de esta orden

          // Calcular el valor total de la orden
          if (order.products && Array.isArray(order.products)) {
            order.products.forEach(item => {
              // **CLAVE:** Sumar (cantidad * precioVenta)
              const precio = parseFloat(item.precioVenta) || 0; 
              const cantidad = item.cantidad || 0; 
              ordenTotalValor += precio * cantidad;
            });
          }

          if (clientId) {
            // Inicializar o sumar el valor de la orden al total acumulado del cliente
            valorVendidoPorCliente[clientId] = valorVendidoPorCliente[clientId] || { 
                nombre: clientName, 
                valorTotal: 0, 
                conteoPedidos: 0 
            };
            valorVendidoPorCliente[clientId].valorTotal += ordenTotalValor;
            valorVendidoPorCliente[clientId].conteoPedidos += 1;
          }
        });

        // 3. Determinar el Cliente del Mes: Encontrar el cliente con mayor valorTotal
        let topCliente = null;
        let maxValor = 0;

        for (const id in valorVendidoPorCliente) {
          if (valorVendidoPorCliente[id].valorTotal > maxValor) {
            maxValor = valorVendidoPorCliente[id].valorTotal;
            topCliente = valorVendidoPorCliente[id];
          }
        }
        
        setCliente(topCliente);

      } catch (error) {
        console.error("Error al obtener el cliente del mes:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [startDate, endDate]);

  return (
    <Card elevation={6} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          <StarIcon sx={{ verticalAlign: 'middle', mr: 1 }} color="warning" /> Cliente del Mes
        </Typography>
        
        {loading ? (
          <Box display="flex" alignItems="center">
            <CircularProgress size={24} sx={{ mr: 2 }} />
            <Typography variant="h5">Calculando...</Typography>
          </Box>
        ) : cliente ? (
          <Box display="flex" alignItems="center" mt={2}>
            <Avatar sx={{ bgcolor: 'warning.main', mr: 2, width: 56, height: 56 }}>
              {getInitials(cliente.nombre)}
            </Avatar>
            <div>
              <Typography variant="h5" color="textPrimary">
                **{cliente.nombre}**
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Valor Total: **${cliente.valorTotal.toLocaleString('es-CO')}**
              </Typography>
              <Typography variant="body2" color="textSecondary">
                ({cliente.conteoPedidos} pedidos)
              </Typography>
            </div>
          </Box>
        ) : (
          <Typography variant="body1" color="textSecondary">
            No se encontraron pedidos este mes.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default ClienteDelMes;