import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { firebaseStorage } from '../firebase';

const sanitizeFilename = (filename) => filename.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase();

export const uploadFileToFirebaseStorage = async ({ file, folder }) => {
  if (!firebaseStorage) {
    throw new Error('Firebase Storage is not configured.');
  }

  const safeName = sanitizeFilename(file.name || 'file');
  const objectPath = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 9)}-${safeName}`;
  const objectRef = ref(firebaseStorage, objectPath);

  await uploadBytes(objectRef, file, {
    contentType: file.type || undefined,
  });

  const downloadUrl = await getDownloadURL(objectRef);
  return downloadUrl;
};
