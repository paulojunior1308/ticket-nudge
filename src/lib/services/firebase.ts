import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { Ticket, EmailTemplate } from '@/types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export async function getTickets(): Promise<Ticket[]> {
  const ticketsCol = collection(db, 'tickets');
  const ticketSnapshot = await getDocs(ticketsCol);
  return ticketSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Ticket[];
}

export async function addTicket(ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
  const ticketsCol = collection(db, 'tickets');
  const now = new Date().toISOString();
  await addDoc(ticketsCol, {
    ...ticket,
    createdAt: now,
    updatedAt: now,
    reminderCount: 0,
  });
}

export async function updateTicket(id: string, data: Partial<Ticket>): Promise<void> {
  const ticketRef = doc(db, 'tickets', id);
  await updateDoc(ticketRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteTicket(id: string): Promise<void> {
  const ticketRef = doc(db, 'tickets', id);
  await deleteDoc(ticketRef);
}

export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  const templatesCol = collection(db, 'emailTemplates');
  const templateSnapshot = await getDocs(templatesCol);
  return templateSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as EmailTemplate[];
}

export async function addEmailTemplate(template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
  const templatesCol = collection(db, 'emailTemplates');
  const now = new Date().toISOString();
  await addDoc(templatesCol, {
    ...template,
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateEmailTemplate(id: string, data: Partial<EmailTemplate>): Promise<void> {
  const templateRef = doc(db, 'emailTemplates', id);
  await updateDoc(templateRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteEmailTemplate(id: string): Promise<void> {
  const templateRef = doc(db, 'emailTemplates', id);
  await deleteDoc(templateRef);
} 