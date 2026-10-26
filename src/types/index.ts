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
  isProfileOwner: boolean;
  isDeviceOwner: boolean;
  hasWorkProfile: boolean;
  isWorkProfileSupported: boolean;
  packageName: string;
  androidVersion: number;
}
