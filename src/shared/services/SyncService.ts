import { apiService } from './api';
import { DatabaseService } from './DatabaseService';

export class SyncService {
  private static instance: SyncService;
  private db: DatabaseService;
  private syncQueue: { type: string; action: string; data: any }[] = [];

  private constructor() {
    this.db = DatabaseService.getInstance();
  }

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  // Add an item to sync queue
  private addToSyncQueue(type: string, action: string, data: any) {
    this.syncQueue.push({ type, action, data });
    this.saveQueueToStorage();
  }

  // Save queue to local storage
  private saveQueueToStorage() {
    localStorage.setItem('syncQueue', JSON.stringify(this.syncQueue));
  }

  // Load queue from local storage
  private loadQueueFromStorage() {
    const queue = localStorage.getItem('syncQueue');
    if (queue) {
      this.syncQueue = JSON.parse(queue);
    }
  }

  // Sync a single worker
  async syncWorker(worker: any) {
    try {
      if (navigator.onLine) {
        if (worker.id) {
          await apiService.workers.update(worker.id, worker);
        } else {
          const response = await apiService.workers.create(worker);
          await this.db.updateWorkerById(worker.localId, { id: response.id });
        }
      } else {
        this.addToSyncQueue('worker', worker.id ? 'update' : 'create', worker);
      }
    } catch (error) {
      console.error('Error syncing worker:', error);
      this.addToSyncQueue('worker', worker.id ? 'update' : 'create', worker);
    }
  }

  // Sync a single project
  async syncProject(project: any) {
    try {
      if (navigator.onLine) {
        if (project.id) {
          await apiService.projects.update(project.id, project);
        } else {
          const response = await apiService.projects.create(project);
          await this.db.run('UPDATE projects SET id = ? WHERE id = ?', [response.id, project.localId]);
        }
      } else {
        this.addToSyncQueue('project', project.id ? 'update' : 'create', project);
      }
    } catch (error) {
      console.error('Error syncing project:', error);
      this.addToSyncQueue('project', project.id ? 'update' : 'create', project);
    }
  }

  // Sync attendance
  async syncAttendance(attendance: any) {
    try {
      if (navigator.onLine) {
        if (attendance.id) {
          await apiService.attendance.updateAttendance(attendance.id, attendance);
        } else {
          const response = await apiService.attendance.markAttendance(attendance);
          await this.db.run('UPDATE attendance SET id = ? WHERE id = ?', [response.id, attendance.localId]);
        }
      } else {
        this.addToSyncQueue('attendance', attendance.id ? 'update' : 'create', attendance);
      }
    } catch (error) {
      console.error('Error syncing attendance:', error);
      this.addToSyncQueue('attendance', attendance.id ? 'update' : 'create', attendance);
    }
  }

  // Process the sync queue
  async processSyncQueue() {
    if (!navigator.onLine) return;

    this.loadQueueFromStorage();
    const queue = [...this.syncQueue];
    this.syncQueue = [];
    this.saveQueueToStorage();

    for (const item of queue) {
      try {
        switch (item.type) {
          case 'worker':
            await this.syncWorker(item.data);
            break;
          case 'project':
            await this.syncProject(item.data);
            break;
          case 'attendance':
            await this.syncAttendance(item.data);
            break;
        }
      } catch (error) {
        console.error(`Error processing sync item:`, error);
        this.addToSyncQueue(item.type, item.action, item.data);
      }
    }
  }

  // Initialize sync listeners
  initSyncListeners() {
    window.addEventListener('online', () => {
      this.processSyncQueue();
    });

    // Check for pending syncs periodically
    setInterval(() => {
      if (navigator.onLine) {
        this.processSyncQueue();
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
  }
}
