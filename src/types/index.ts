export interface InstalledApp {
  packageName: string;
  name: string;
  icon: string; // base64 data URI
  isSystem: boolean;
  category?: 'social' | 'messaging' | 'gaming' | 'utility' | 'other';
}

export interface ClonedApp {
  packageName: string;
  appName: string;
  cloneName: string;
  cloneId: string;
  createdAt: number;
  isFrozen: boolean;
  icon: string;
}

export interface EngineStatus {
  engineReady: boolean; // NewBlackbox virtual services are running
  is64Bit: boolean;
  virtualUserCount: number; // one virtual user per clone
  packageName: string;
  androidVersion: number;
}
