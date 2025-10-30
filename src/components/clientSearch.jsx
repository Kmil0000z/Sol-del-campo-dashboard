// src/components/ClientSearch.jsx

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { 
    Box, 
    Typography, 
    Paper, 
    Autocomplete, 
    TextField, 
    CircularProgress,
    Divider 
} from '@mui/material';

// Importa tu configuración de Firebase
import { db } from '../firebase'; 
import { collection, query, where, getDocs } from 'firebase/firestore';
import ClientOrdersHistory from './clientOrdersHistory'; 

const CLIENTS_COLLECTION = "Client"; 

// 🚨 FUNCIÓN DE UTILIDAD: Para que los nombres se vean bonitos (solo visual) 🚨
// Mantiene la primera letra de cada palabra en mayúscula.
const toTitleCase = (str) => {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(function(word) {
        return (word.charAt(0).toUpperCase() + word.slice(1));
    }).join(' ');
};

// 🚨 FUNCIÓN CLAVE: Normaliza el término de búsqueda al formato Title Case 🚨
// Esto es necesario para que la búsqueda case-sensitive de Firestore funcione.
const toTitleCaseQuery = (query) => {
    if (!query) return '';
    // Aseguramos que la primera letra sea mayúscula y el resto minúsculas.
    return query.charAt(0).toUpperCase() + query.slice(1).toLowerCase();
};


export default function ClientSearch() {
    const [clientOptions, setClientOptions] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchClients = useCallback(async (search) => {
        if (search.length < 1) { // Reducimos a 1 carácter para probar el Title Case
            setClientOptions([]);
            return;
        }

        setLoading(true);
        let allClients = [];
        
        // 🚨 PASO CLAVE: NORMALIZAR LA BÚSQUEDA A TITLE CASE
        const normalizedQuery = toTitleCaseQuery(search); 
        const searchEnd = normalizedQuery + '\uf8ff'; 

        try {
            const clientsRef = collection(db, CLIENTS_COLLECTION);

            // 1. CONSULTA POR NOMBRES
            const qNombres = query(
                clientsRef,
                where('nombres', '>=', normalizedQuery),
                where('nombres', '<=', searchEnd)
            );
            const snapshotNombres = await getDocs(qNombres);
            
            snapshotNombres.forEach(doc => {
                allClients.push({ id: doc.id, ...doc.data() });
            });

            // 2. CONSULTA POR APELLIDOS
            const qApellidos = query(
                clientsRef,
                where('apellidos', '>=', normalizedQuery),
                where('apellidos', '<=', searchEnd)
            );
            const snapshotApellidos = await getDocs(qApellidos);
            
            // Combinar y prevenir duplicados
            snapshotApellidos.forEach(doc => {
                if (!allClients.some(c => c.id === doc.id)) {
                    allClients.push({ id: doc.id, ...doc.data() });
                }
            });

            // Mapear los resultados finales para el Autocomplete
            const finalClients = allClients.map(data => {
                // El formato de la BD es Title Case, por lo que lo combinamos directamente
                const fullName = `${data.nombres || ''} ${data.apellidos || ''}`.trim();
                
                return {
                    id: data.id,
                    ...data,
                    // Usamos la función toTitleCase para que el Autocomplete siempre se vea bien.
                    label: toTitleCase(fullName), 
                    clientName: toTitleCase(fullName),
                };
            });

            setClientOptions(finalClients);

        } catch (error) {
            console.error("Error buscando clientes:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchClients(searchTerm);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm, fetchClients]);


    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Búsqueda de Clientes
            </Typography>
            
            <Box sx={{ mb: 4, maxWidth: 500 }}>
                <Autocomplete
                    options={clientOptions}
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    value={selectedClient}
                    onChange={(event, newValue) => {
                        setSelectedClient(newValue);
                    }}
                    onInputChange={(event, newInputValue) => {
                        if (newInputValue !== selectedClient?.label) {
                             setSelectedClient(null);
                        }
                        setSearchTerm(newInputValue);
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Buscar Cliente (Formato Título)"
                            fullWidth
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <React.Fragment>
                                        {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                        {params.InputProps.endAdornment}
                                    </React.Fragment>
                                ),
                            }}
                        />
                    )}
                />
            </Box>

            <Divider />

            {/* --- Listado de Pedidos Históricos --- */}
            {selectedClient ? (
                <ClientOrdersHistory 
                    clientId={selectedClient.id} 
                    clientName={selectedClient.clientName} 
                />
            ) : (
                <Box sx={{ mt: 3, p: 2, textAlign: 'center', border: '1px dashed #ccc', borderRadius: 1 }}>
                    <Typography color="text.secondary">
                        Por favor, selecciona un cliente para ver su historial de pedidos.
                    </Typography>
                </Box>
            )}
        </Paper>
    );
}