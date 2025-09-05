export class SyncService {
  private static instance: SyncService;

  private constructor() {
    this.init();
  }

  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  private async init() {
    // Initialize listeners for online/offline status
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }

  private async handleOnline() {
    console.log('Back online');
  }

  private async handleOffline() {
    console.log('Gone offline');
  }
}
