import React, { createContext, useState, useContext } from 'react';
import { startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';

const DateFilterContext = createContext();

// Define el rango inicial como el mes actual por defecto
const defaultStartDate = startOfMonth(new Date());
const defaultEndDate = endOfDay(new Date());

export const DateFilterProvider = ({ children }) => {
    // El estado mantendrá las fechas como objetos Date
    const [startDate, setStartDate] = useState(defaultStartDate);
    const [endDate, setEndDate] = useState(defaultEndDate);

    // Función para manejar el cambio de la fecha de inicio
    const handleStartDateChange = (newDate) => {
        if (newDate) {
            setStartDate(startOfDay(newDate)); // Asegura que empiece a las 00:00:00
        }
    };

    // Función para manejar el cambio de la fecha fin
    const handleEndDateChange = (newDate) => {
        if (newDate) {
            setEndDate(endOfDay(newDate)); // Asegura que termine a las 23:59:59
        }
    };

    return (
        <DateFilterContext.Provider 
            value={{ 
                startDate, 
                endDate, 
                handleStartDateChange, 
                handleEndDateChange 
            }}
        >
            {children}
        </DateFilterContext.Provider>
    );
};

// Hook para consumir el contexto en cualquier componente de métrica
export const useDateFilter = () => useContext(DateFilterContext);