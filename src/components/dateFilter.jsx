// src/components/DateFilter.jsx
import React from 'react';
import { Box, Grid } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useDateFilter } from '../context/dateFilterContext';
import { es } from 'date-fns/locale'; 

function DateFilter() {
    const { startDate, endDate, handleStartDateChange, handleEndDateChange } = useDateFilter();

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <Box sx={{ mb: 3 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                        <DatePicker
                            label="Fecha de Inicio"
                            value={startDate}
                            onChange={handleStartDateChange}
                            slotProps={{ textField: { fullWidth: true } }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <DatePicker
                            label="Fecha Fin"
                            value={endDate}
                            onChange={handleEndDateChange}
                            slotProps={{ textField: { fullWidth: true } }}
                            minDate={startDate} // La fecha fin no puede ser anterior a la fecha inicio
                        />
                    </Grid>
                    {/* Puedes añadir un botón de "Aplicar" aquí si lo prefieres, pero los datos se actualizarán automáticamente */}
                </Grid>
            </Box>
        </LocalizationProvider>
    );
}

export default DateFilter;