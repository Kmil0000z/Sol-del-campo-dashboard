import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

function DataPanel() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "Product"), orderBy("nombre", "asc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setProducts(items);
      setLoading(false);
    });

    (error) => {
      console.error("Error al obtener los datos de Firestore:", error);
      setLoading(false);
    };

    return () => unsubscribe(); 
  }, []);

  if (loading) {
    return <h2>Cargando productos...</h2>;
  }

  return (
    <div>
      <h2>📋 Listado de Productos ({products.length} Items)</h2>
      {products.map(product => (
        <div key={product.id} style={styles.card}>
          <p style={styles.name}>**{product.nombre}**</p>
          <p>
            **Categoría:** {product.categoria} | **Estado:** {product.estado}
          </p>
          <p>
            **Precio Venta:** ${product.precioVenta.toLocaleString('es-CO')}
          </p>
          <p style={styles.smallText}>
            *Precio Sugerido: ${product.precioSugerido.toLocaleString('es-CO')}*
          </p>
        </div>
      ))}
    </div>
  );
}

const styles = {
  card: {
    border: '1px solid #ddd',
    padding: '15px',
    margin: '10px 0',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9'
  },
  name: {
    fontSize: '1.2em',
    fontWeight: 'bold',
    color: '#333'
  },
  smallText: {
    fontSize: '0.8em',
    color: '#777'
  }
};

export default DataPanel;