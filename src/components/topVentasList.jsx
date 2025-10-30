import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider, Box, CircularProgress } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useDateFilter } from '../context/dateFilterContext';
import { db } from '../firebase';

function topVentasList() {
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { startDate, endDate } = useDateFilter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const startString = startDate.toISOString();
        const endString = endDate.toISOString();

        // 1. Consulta: Órdenes dentro del mes en curso
        const q = query(
          collection(db, "Sale"), // 🚨 Verifica que tu colección se llame 'Orders'
          where("fecha", ">=", startString),
          where("fecha", "<=", endString)
        );

        const snapshot = await getDocs(q);
        const productoVentas = {}; // Objeto para acumular {nombreProducto: totalUnidades}

        // 2. Procesar: Iterar sobre todas las órdenes y sus arrays de productos
        snapshot.forEach(doc => {
          const order = doc.data();
          if (order.products && Array.isArray(order.products)) {
            order.products.forEach(item => {
              const nombre = item.nombre || 'Producto Desconocido';
              const cantidad = item.cantidad || 0;

              // Acumular la cantidad vendida por nombre de producto
              productoVentas[nombre] = (productoVentas[nombre] || 0) + cantidad;
            });
          }
        });

        // 3. Transformar y Ordenar: Convertir el objeto a un array y ordenar por cantidad
        const sortedProducts = Object.keys(productoVentas)
          .map(nombre => ({
            nombre,
            unidadesVendidas: productoVentas[nombre],
          }))
          .sort((a, b) => b.unidadesVendidas - a.unidadesVendidas) // De mayor a menor
          .slice(0, 5); // Tomar solo los Top 5

        setTopProducts(sortedProducts);

      } catch (error) {
        console.error("Error al obtener el Top 5 de ventas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  return (
    <Card elevation={6} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" gutterBottom>
          <TrendingUpIcon sx={{ verticalAlign: 'middle', mr: 1 }} color="success" /> Top 5 Productos Más Vendidos
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {loading ? (
          <Box display="flex" alignItems="center">
            <CircularProgress size={24} sx={{ mr: 2 }} />
            <Typography>Calculando Top 5...</Typography>
          </Box>
        ) : (
          <List disablePadding>
            {topProducts.length === 0 ? (
              <ListItemText primary="No hay datos de ventas para este mes." />
            ) : (
              topProducts.map((p, index) => (
                <ListItem
                  key={p.nombre}
                  disableGutters
                  sx={{ py: 1, '&:hover': { bgcolor: '#f5f5f5' } }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      {index + 1}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={p.nombre}
                    secondary={`Unidades vendidas: ${p.unidadesVendidas.toLocaleString('es-CO')}`}
                  />
                </ListItem>
              ))
            )}
          </List>
        )}
      </CardContent>
    </Card>
  );
}

export default topVentasList;