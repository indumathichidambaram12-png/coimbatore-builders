import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where
} from 'firebase/firestore';
import { db } from './firebase';
import { WorkerType, ProjectType } from '../types';

export class FirebaseService {
  // Workers
  async getWorkers() {
    const workersRef = collection(db, 'workers');
    const snapshot = await getDocs(workersRef);
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...(doc.data() as { is_active?: boolean }) }))
      .filter(worker => worker.is_active !== false) as WorkerType[];
  }

  async createWorker(worker: Omit<WorkerType, 'id'>) {
    const workersRef = collection(db, 'workers');
    const docRef = await addDoc(workersRef, {
      ...worker,
      is_active: true,
      created_at: new Date().toISOString()
    });
    return docRef.id;
  }

  async updateWorkerById(id: string, worker: Partial<WorkerType>) {
    const workerRef = doc(db, 'workers', id);
    await updateDoc(workerRef, {
      ...worker,
      updated_at: new Date().toISOString()
    });
  }

  async deleteWorker(id: string) {
    const workerRef = doc(db, 'workers', id);
    await updateDoc(workerRef, {
      is_active: false,
      deleted_at: new Date().toISOString()
    });
  }

  // Projects
  async getProjects() {
    const projectsRef = collection(db, 'projects');
    const snapshot = await getDocs(projectsRef);
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...(doc.data() as { is_active?: boolean }) }))
      .filter(project => project.is_active !== false) as ProjectType[];
  }

  async createProject(project: Omit<ProjectType, 'id'>) {
    const projectsRef = collection(db, 'projects');
    const docRef = await addDoc(projectsRef, {
      ...project,
      is_active: true,
      created_at: new Date().toISOString()
    });
    return docRef.id;
  }

  async updateProjectById(id: string, project: Partial<ProjectType>) {
    const projectRef = doc(db, 'projects', id);
    await updateDoc(projectRef, {
      ...project,
      updated_at: new Date().toISOString()
    });
  }

  async deleteProject(id: string) {
    const projectRef = doc(db, 'projects', id);
    await updateDoc(projectRef, {
      is_active: false,
      deleted_at: new Date().toISOString()
    });
  }

  // Worker-Project Relations
  async assignWorkerToProject(workerId: string, projectId: string) {
    const workerRef = doc(db, 'workers', workerId);
    await updateDoc(workerRef, {
      project_id: projectId,
      updated_at: new Date().toISOString()
    });
  }

  async removeWorkerFromProject(workerId: string) {
    const workerRef = doc(db, 'workers', workerId);
    await updateDoc(workerRef, {
      project_id: null,
      updated_at: new Date().toISOString()
    });
  }

  async getWorkersByProject(projectId: string) {
    const workersRef = collection(db, 'workers');
    const q = query(
      workersRef,
      where('project_id', '==', projectId),
      where('is_active', '==', true)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as WorkerType[];
  }
}
