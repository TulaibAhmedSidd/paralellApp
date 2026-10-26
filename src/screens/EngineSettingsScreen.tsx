import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { EngineStatus } from '../types';
import {
  ShieldCheck,
  Cpu,
  Layers,
  Lock,
  Snowflake,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react-native';

interface Props {
  engineStatus: EngineStatus | null;
  onRequestProvision: () => void;
  onFreezeAll: () => void;
  onToggleVaultLock: () => void;
  isVaultLocked: boolean;
}

export const EngineSettingsScreen: React.FC<Props> = ({
  engineStatus,
  onRequestProvision,
  onFreezeAll,
  onToggleVaultLock,
  isVaultLocked,
}) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Engine Architecture Header */}
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.iconBox}>
            <Cpu size={22} color="#38BDF8" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Android Isolation Engine</Text>
            <Text style={styles.cardSubtitle}>
              Work Profile & Container Architecture
            </Text>
          </View>
        </View>

        <Text style={styles.explainText}>
          Unlike outdated cloner apps that use dangerous Binder hooking and dynamic DEX loading (which crash on Android 11-15 and get blocked by Play Protect), this app leverages Android's native Work Profile container architecture.
        </Text>

        <View style={styles.featureGrid}>
          <View style={styles.featureItem}>
            <CheckCircle2 size={16} color="#4ADE80" />
            <Text style={styles.featureText}>Separate Linux UID</Text>
          </View>
          <View style={styles.featureItem}>
            <CheckCircle2 size={16} color="#4ADE80" />
            <Text style={styles.featureText}>Isolated Keyring & Keystore</Text>
          </View>
          <View style={styles.featureItem}>
            <CheckCircle2 size={16} color="#4ADE80" />
            <Text style={styles.featureText}>Separate SQLite & Cache</Text>
          </View>
          <View style={styles.featureItem}>
            <CheckCircle2 size={16} color="#4ADE80" />
            <Text style={styles.featureText}>Zero Account Ban Risk</Text>
          </View>
        </View>
      </View>

      {/* Engine Diagnostics */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Engine Diagnostics</Text>

        <View style={styles.diagRow}>
          <Text style={styles.diagLabel}>Managed Profile Support:</Text>
          <Text style={[styles.diagValue, { color: '#4ADE80' }]}>
            {engineStatus?.isWorkProfileSupported ? 'Supported' : 'Native Mode'}
          </Text>
        </View>

        <View style={styles.diagRow}>
          <Text style={styles.diagLabel}>Profile Owner Status:</Text>
          <Text style={[styles.diagValue, engineStatus?.isProfileOwner ? { color: '#4ADE80' } : { color: '#FBBF24' }]}>
            {engineStatus?.isProfileOwner ? 'Active (Admin)' : 'Ready for Provision'}
          </Text>
        </View>

        <View style={styles.diagRow}>
          <Text style={styles.diagLabel}>Work Profile Initialized:</Text>
          <Text style={[styles.diagValue, engineStatus?.hasWorkProfile ? { color: '#4ADE80' } : { color: '#94A3B8' }]}>
            {engineStatus?.hasWorkProfile ? 'Yes (User 10+)' : 'Standard Sandbox'}
          </Text>
        </View>

        <View style={styles.diagRow}>
          <Text style={styles.diagLabel}>Android API Level:</Text>
          <Text style={styles.diagValue}>
            {engineStatus?.androidVersion ? `API ${engineStatus.androidVersion}` : 'Android 14+'}
          </Text>
        </View>

        {!engineStatus?.hasWorkProfile && (
          <TouchableOpacity
            style={styles.provisionBtn}
            onPress={onRequestProvision}>
            <ExternalLink size={16} color="#FFFFFF" />
            <Text style={styles.provisionBtnText}>
              Provision Android Work Profile
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Quick Power Controls */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Sandbox Controls</Text>

        <TouchableOpacity style={styles.controlRow} onPress={onFreezeAll}>
          <View style={[styles.controlIcon, { backgroundColor: 'rgba(56, 189, 248, 0.12)' }]}>
            <Snowflake size={18} color="#38BDF8" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.controlTitle}>Freeze All Clones</Text>
            <Text style={styles.controlDesc}>
              Instantly pause all cloned processes to save battery and RAM.
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlRow} onPress={onToggleVaultLock}>
          <View style={[styles.controlIcon, { backgroundColor: 'rgba(244, 63, 94, 0.12)' }]}>
            <Lock size={18} color="#F43F5E" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.controlTitle}>Lock Space with PIN</Text>
            <Text style={styles.controlDesc}>
              {isVaultLocked ? 'Space is locked with 4-digit PIN' : 'Tap to immediately lock with PIN'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  explainText: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 19,
    marginBottom: 14,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  featureText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  diagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  diagLabel: {
    color: '#94A3B8',
    fontSize: 13,
  },
  diagValue: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
  },
  provisionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 16,
    gap: 8,
  },
  provisionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    gap: 12,
  },
  controlIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  controlDesc: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
});
