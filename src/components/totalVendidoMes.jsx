import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useDateFilter } from '../context/dateFilterContext';
import { db } from '../firebase';

function TotalVendidoMes() {
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const { startDate, endDate } = useDateFilter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const startString = startDate.toISOString();
      const endString = endDate.toISOString();

      try {
        const q = query(
          collection(db, "Sale"),
          where("fecha", ">=", startString),
          where("fecha", "<=", endString)
        );

        const snapshot = await getDocs(q);
        let sum = 0;
        
        snapshot.forEach(doc => {
          const sale = doc.data();
          if (sale.products && Array.isArray(sale.products)) {
            sale.products.forEach(item => {
              const precio = parseFloat(item.precioVenta) || 0; 
              const cantidad = item.cantidad || 0; 
              sum += precio * cantidad;
            });
          }
        });

        setTotal(sum);
      } catch (error) {
        console.error("Error al obtener el total vendido:", error);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [startDate, endDate]);

  return (
    <Card elevation={6} sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Total Vendido
          </Typography>
          <AttachMoneyIcon color="primary" sx={{ fontSize: 40 }} />
        </Box>
        
        {loading ? (
          <Box display="flex" alignItems="center">
            <CircularProgress size={24} sx={{ mr: 2 }} />
            <Typography variant="h4">Calculando...</Typography>
          </Box>
        ) : (
          <Typography variant="h3" color="primary">
            **${total.toLocaleString('es-CO')}**
          </Typography>
        )}
        
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          Ingreso acumulado en ventas de este mes.
        </Typography>
      </CardContent>
    </Card>
  );
}

export default TotalVendidoMes;