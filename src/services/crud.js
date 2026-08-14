import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../firebase';

export async function createDocument(path, data) {
  const ref = await addDoc(collection(db, path), data);
  return { id: ref.id, ...data };
}

export async function updateDocument(path, id, data) {
  await updateDoc(doc(db, path, id), data);
}

export async function deleteDocument(path, id) {
  await deleteDoc(doc(db, path, id));
}

export async function bulkDelete(pathNames = []) {
  for (const name of pathNames) {
    const snap = await getDocs(collection(db, name));
    await Promise.all(snap.docs.map((d) => deleteDoc(doc(db, name, d.id))));
  }
}

export async function createDocuments(path, list = []) {
  const created = [];
  for (const item of list) {
    const result = await createDocument(path, item);
    created.push(result);
  }
  return created;
}
