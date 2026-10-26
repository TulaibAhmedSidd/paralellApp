import { NativeModules, Platform } from 'react-native';
import { ClonedApp, EngineStatus, InstalledApp } from '../types';

const { ParallelCloneModule } = NativeModules;

// Sample fallback data for emulator / testing mode
const MOCK_INSTALLED_APPS: InstalledApp[] = [
  {
    packageName: 'com.whatsapp',
    name: 'WhatsApp Messenger',
    icon: '',
    isSystem: false,
    category: 'messaging',
  },
  {
    packageName: 'com.instagram.android',
    name: 'Instagram',
    icon: '',
    isSystem: false,
    category: 'social',
  },
  {
    packageName: 'org.telegram.messenger',
    name: 'Telegram',
    icon: '',
    isSystem: false,
    category: 'messaging',
  },
  {
    packageName: 'com.facebook.katana',
    name: 'Facebook',
    icon: '',
    isSystem: false,
    category: 'social',
  },
  {
    packageName: 'com.google.android.youtube',
    name: 'YouTube',
    icon: '',
    isSystem: true,
    category: 'utility',
  },
  {
    packageName: 'com.pubg.imobile',
    name: 'Battlegrounds / Games',
    icon: '',
    isSystem: false,
    category: 'gaming',
  },
];

let mockClones: ClonedApp[] = [
  {
    packageName: 'com.whatsapp',
    appName: 'WhatsApp Messenger',
    cloneName: 'Work & Private #1',
    cloneId: 'clone_mock_1',
    createdAt: Date.now() - 3600000 * 24,
    isFrozen: false,
    icon: '',
  },
  {
    packageName: 'org.telegram.messenger',
    appName: 'Telegram',
    cloneName: 'Business Space',
    cloneId: 'clone_mock_2',
    createdAt: Date.now() - 3600000 * 12,
    isFrozen: false,
    icon: '',
  },
];

export const ParallelClone = {
  isAvailable(): boolean {
    return Platform.OS === 'android' && Boolean(ParallelCloneModule);
  },

  async getEngineStatus(): Promise<EngineStatus> {
    if (this.isAvailable()) {
      try {
        return await ParallelCloneModule.getEngineStatus();
      } catch (err) {
        console.warn('Native getEngineStatus failed, using fallback:', err);
      }
    }
    return {
      isProfileOwner: false,
      isDeviceOwner: false,
      hasWorkProfile: false,
      isWorkProfileSupported: true,
      packageName: 'com.parallelcloneapp',
      androidVersion: 34,
    };
  },

  async requestProvisionWorkProfile(): Promise<string> {
    if (this.isAvailable()) {
      return await ParallelCloneModule.requestProvisionWorkProfile();
    }
    return 'MOCK_PROVISION_REQUESTED';
  },

  async getInstalledApps(): Promise<InstalledApp[]> {
    if (this.isAvailable()) {
      try {
        const apps: InstalledApp[] = await ParallelCloneModule.getInstalledApps();
        if (apps && apps.length > 0) {
          return apps;
        }
      } catch (err) {
        console.warn('Native getInstalledApps failed, falling back:', err);
      }
    }
    return MOCK_INSTALLED_APPS;
  },

  async getClonedApps(): Promise<ClonedApp[]> {
    if (this.isAvailable()) {
      try {
        const clones: ClonedApp[] = await ParallelCloneModule.getClonedApps();
        return clones;
      } catch (err) {
        console.warn('Native getClonedApps failed, falling back:', err);
      }
    }
    return [...mockClones];
  },

  async cloneApp(packageName: string, cloneLabel: string = ''): Promise<{ success: boolean; cloneId: string }> {
    if (this.isAvailable()) {
      try {
        return await ParallelCloneModule.cloneApp(packageName, cloneLabel);
      } catch (err) {
        console.warn('Native cloneApp failed, using state fallback:', err);
      }
    }
    const cloneId = 'clone_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    mockClones.push({
      packageName,
      appName: packageName.split('.').pop() || packageName,
      cloneName: cloneLabel || `Clone #${mockClones.length + 1}`,
      cloneId,
      createdAt: Date.now(),
      isFrozen: false,
      icon: '',
    });
    return { success: true, cloneId };
  },

  async launchApp(packageName: string, isClone: boolean = true): Promise<string> {
    if (this.isAvailable()) {
      return await ParallelCloneModule.launchApp(packageName, isClone);
    }
    return 'MOCK_LAUNCH_SUCCESS';
  },

  async removeClonedApp(cloneId: string): Promise<boolean> {
    if (this.isAvailable()) {
      try {
        return await ParallelCloneModule.removeClonedApp(cloneId);
      } catch (err) {
        console.warn('Native removeClonedApp failed:', err);
      }
    }
    mockClones = mockClones.filter(c => c.cloneId !== cloneId);
    return true;
  },

  async toggleFreezeApp(cloneId: string, freeze: boolean): Promise<boolean> {
    if (this.isAvailable()) {
      try {
        return await ParallelCloneModule.toggleFreezeApp(cloneId, freeze);
      } catch (err) {
        console.warn('Native toggleFreezeApp failed:', err);
      }
    }
    const target = mockClones.find(c => c.cloneId === cloneId);
    if (target) {
      target.isFrozen = freeze;
    }
    return freeze;
  },
};
