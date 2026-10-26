import React, { useEffect, useState, useCallback } from 'react';
import {
  Alert,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { ClonedApp, EngineStatus, InstalledApp } from './src/types';
import { ParallelClone } from './src/native/ParallelClone';
import { Header } from './src/components/Header';
import { HomeScreen } from './src/screens/HomeScreen';
import { AddCloneScreen } from './src/screens/AddCloneScreen';
import { EngineSettingsScreen } from './src/screens/EngineSettingsScreen';
import { VaultLockModal } from './src/components/VaultLockModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'library' | 'engine'>('home');
  const [clones, setClones] = useState<ClonedApp[]>([]);
  const [installedApps, setInstalledApps] = useState<InstalledApp[]>([]);
  const [engineStatus, setEngineStatus] = useState<EngineStatus | null>(null);
  const [isVaultLocked, setIsVaultLocked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [status, cloneList, appList] = await Promise.all([
        ParallelClone.getEngineStatus(),
        ParallelClone.getClonedApps(),
        ParallelClone.getInstalledApps(),
      ]);
      setEngineStatus(status);
      setClones(cloneList);
      setInstalledApps(appList);
    } catch (err) {
      console.warn('Failed to load initial data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    (StatusBar as any).setBackgroundColor?.('#0F172A', true);
    loadData();
  }, [loadData]);

  const handleLaunch = async (clone: ClonedApp) => {
    if (clone.isFrozen) {
      Alert.alert(
        'App is Frozen',
        `${clone.appName} is currently frozen. Unfreeze it first to run?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Unfreeze & Launch',
            onPress: async () => {
              await ParallelClone.toggleFreezeApp(clone.cloneId, false);
              setClones(prev =>
                prev.map(c => (c.cloneId === clone.cloneId ? { ...c, isFrozen: false } : c)),
              );
              await ParallelClone.launchApp(clone.packageName, true);
            },
          },
        ],
      );
      return;
    }

    try {
      await ParallelClone.launchApp(clone.packageName, true);
    } catch (err) {
      Alert.alert('Launch Notice', `Starting ${clone.appName} in isolated container.`);
    }
  };

  const handleToggleFreeze = async (clone: ClonedApp) => {
    const nextState = !clone.isFrozen;
    await ParallelClone.toggleFreezeApp(clone.cloneId, nextState);
    setClones(prev =>
      prev.map(c => (c.cloneId === clone.cloneId ? { ...c, isFrozen: nextState } : c)),
    );
  };

  const handleRemove = async (clone: ClonedApp) => {
    await ParallelClone.removeClonedApp(clone.cloneId);
    setClones(prev => prev.filter(c => c.cloneId !== clone.cloneId));
  };

  const handleCloneApp = async (app: InstalledApp) => {
    const cloneNumber = clones.filter(c => c.packageName === app.packageName).length + 1;
    const label = `Clone #${cloneNumber}`;

    const res = await ParallelClone.cloneApp(app.packageName, label);
    if (res.success) {
      const updatedClones = await ParallelClone.getClonedApps();
      setClones(updatedClones);
      setActiveTab('home');
      Alert.alert(
        'App Cloned Successfully!',
        `${app.name} has been duplicated into your isolated space with a fresh data sandbox.`,
      );
    }
  };

  const handleFreezeAll = async () => {
    for (const clone of clones) {
      await ParallelClone.toggleFreezeApp(clone.cloneId, true);
    }
    setClones(prev => prev.map(c => ({ ...c, isFrozen: true })));
    Alert.alert('All Clones Frozen', 'All background isolated processes are suspended.');
  };

  const handleRequestProvision = async () => {
    try {
      await ParallelClone.requestProvisionWorkProfile();
    } catch (err: any) {
      Alert.alert(
        'Provision Notice',
        err?.message || 'Work Profile enrollment initiated in Android Settings.',
      );
    }
  };

  const clonedPackageNames = new Set(clones.map(c => c.packageName));

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.root}>
        <Header
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isLocked={isVaultLocked}
          onToggleLock={() => setIsVaultLocked(true)}
          onRefresh={loadData}
        />

        {activeTab === 'home' && (
          <HomeScreen
            clones={clones}
            onLaunch={handleLaunch}
            onToggleFreeze={handleToggleFreeze}
            onRemove={handleRemove}
            onNavigateAdd={() => setActiveTab('library')}
            hasWorkProfile={Boolean(engineStatus?.hasWorkProfile)}
          />
        )}

        {activeTab === 'library' && (
          <AddCloneScreen
            installedApps={installedApps}
            clonedPackageNames={clonedPackageNames}
            onCloneApp={handleCloneApp}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'engine' && (
          <EngineSettingsScreen
            engineStatus={engineStatus}
            onRequestProvision={handleRequestProvision}
            onFreezeAll={handleFreezeAll}
            onToggleVaultLock={() => setIsVaultLocked(true)}
            isVaultLocked={isVaultLocked}
          />
        )}

        {/* PIN Vault Lock Modal */}
        <VaultLockModal
          visible={isVaultLocked}
          onUnlock={() => setIsVaultLocked(false)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  root: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
});
