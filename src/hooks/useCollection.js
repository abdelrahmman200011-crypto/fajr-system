import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export function useCollection(path, normalize = (row) => row) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      collection(db, path),
      (snapshot) => {
        const list = snapshot.docs.map((docSnap) => {
          const raw = { id: docSnap.id, ...docSnap.data() };
          return normalize(raw);
        });
        setItems(list);
        setLoading(false);
      },
      (err) => {
        console.error(`فشل مزامنة المجموعة: ${path}`, err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [path, normalize]);

  return { items, loading, error };
}
