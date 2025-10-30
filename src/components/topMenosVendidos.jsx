import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider, Box, CircularProgress } from '@mui/material';
import TrendingDownIcon from '@mui/icons-material/TrendingDown'; // 🚨 Nuevo Icono
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useDateFilter } from '../context/dateFilterContext';
import { db } from '../firebase';

function TopMenosVendidoList() {
  const [bottomProducts, setBottomProducts] = useState([]);
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
          collection(db, "Sale"), 
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
              
              productoVentas[nombre] = (productoVentas[nombre] || 0) + cantidad;
            });
          }
        });

        // 3. Transformar y Ordenar:
        const sortedProducts = Object.keys(productoVentas)
          .map(nombre => ({
            nombre,
            unidadesVendidas: productoVentas[nombre],
          }))
          // 🚨 CLAVE: ORDENAR DE MENOR A MAYOR (a - b)
          .sort((a, b) => a.unidadesVendidas - b.unidadesVendidas) 
          .slice(0, 5); // Tomar solo los Top 5 menos vendidos
        
        setBottomProducts(sortedProducts);

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
          <TrendingDownIcon sx={{ verticalAlign: 'middle', mr: 1 }} color="error" /> Top 5 Productos Menos Vendidos
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        {loading ? (
          <Box display="flex" alignItems="center">
            <CircularProgress size={24} sx={{ mr: 2 }} />
            <Typography>Calculando Top 5...</Typography>
          </Box>
        ) : (
          <List disablePadding>
            {bottomProducts.length === 0 ? (
              <ListItemText primary="No hay datos de ventas para este mes." />
            ) : (
              bottomProducts.map((p, index) => (
                <ListItem 
                  key={p.nombre} 
                  disableGutters
                  sx={{ py: 1, '&:hover': { bgcolor: '#f5f5f5' } }}
                >
                  <ListItemAvatar>
                    {/* Usamos el color 'error' para visualmente indicar el bajo rendimiento */}
                    <Avatar sx={{ bgcolor: 'error.main' }}> 
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

export default TopMenosVendidoList;