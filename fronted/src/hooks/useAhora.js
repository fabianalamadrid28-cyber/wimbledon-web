import { useEffect, useState } from 'react';

// Devuelve la hora actual (ms) y se actualiza cada `cadaMs`; sirve para los cronómetros en pantalla.
export function useAhora(cadaMs = 1000) {
  const [ahora, setAhora] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), cadaMs);
    return () => clearInterval(id);
  }, [cadaMs]);
  return ahora;
}
