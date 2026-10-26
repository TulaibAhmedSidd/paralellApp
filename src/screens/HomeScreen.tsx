import React from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ClonedApp } from '../types';
import { CloneCard } from '../components/CloneCard';
import { Plus, Shield, Cpu, Zap } from 'lucide-react-native';

interface Props {
  clones: ClonedApp[];
  onLaunch: (clone: ClonedApp) => void;
  onToggleFreeze: (clone: ClonedApp) => void;
  onRemove: (clone: ClonedApp) => void;
  onNavigateAdd: () => void;
  hasWorkProfile: boolean;
}

export const HomeScreen: React.FC<Props> = ({
  clones,
  onLaunch,
  onToggleFreeze,
  onRemove,
  onNavigateAdd,
  hasWorkProfile,
}) => {
  const confirmRemove = (clone: ClonedApp) => {
    Alert.alert(
      'Remove Cloned App?',
      `Are you sure you want to remove ${clone.appName} (${clone.cloneName})? Its isolated data will be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => onRemove(clone) },
      ],
    );
  };

  return (
    <View style={styles.container}>
      {/* Sandbox Info Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerIcon}>
          <Shield size={20} color="#38BDF8" />
        </View>
        <View style={styles.bannerTextContainer}>
          <Text style={styles.bannerTitle}>
            {hasWorkProfile ? 'Work Profile Sandbox Active' : 'Isolated Multi-Instance Engine'}
          </Text>
          <Text style={styles.bannerDesc}>
            {hasWorkProfile
              ? 'Native OS user profile isolation. Separate UID, storage & Keystore.'
              : 'Cloned apps run with separate databases, storage and credentials.'}
          </Text>
        </View>
      </View>

      {/* Stats bar */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Cpu size={14} color="#94A3B8" />
          <Text style={styles.statLabel}>Clones:</Text>
          <Text style={styles.statValue}>{clones.length}</Text>
        </View>

        <View style={styles.statItem}>
          <Zap size={14} color="#94A3B8" />
          <Text style={styles.statLabel}>Active:</Text>
          <Text style={styles.statValue}>
            {clones.filter(c => !c.isFrozen).length}
          </Text>
        </View>

        <View style={styles.statItem}>
          <Shield size={14} color="#94A3B8" />
          <Text style={styles.statLabel}>Security:</Text>
          <Text style={[styles.statValue, { color: '#4ADE80' }]}>Isolated</Text>
        </View>
      </View>

      <FlatList
        data={clones}
        keyExtractor={item => item.cloneId}
        renderItem={({ item }) => (
          <CloneCard
            clone={item}
            onLaunch={onLaunch}
            onToggleFreeze={onToggleFreeze}
            onRemove={confirmRemove}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Plus size={36} color="#38BDF8" />
            </View>
            <Text style={styles.emptyTitle}>No Cloned Apps Yet</Text>
            <Text style={styles.emptySubtitle}>
              Clone WhatsApp, Telegram, Instagram, or games to use multiple accounts simultaneously with 100% separate data!
            </Text>
            <TouchableOpacity style={styles.emptyAddBtn} onPress={onNavigateAdd}>
              <Plus size={16} color="#FFFFFF" />
              <Text style={styles.emptyAddBtnText}>Clone Your First App</Text>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={
          clones.length > 0 ? (
            <TouchableOpacity style={styles.addDashedCard} onPress={onNavigateAdd}>
              <Plus size={20} color="#38BDF8" />
              <Text style={styles.addDashedText}>Clone Another App</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(56, 189, 248, 0.15)',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  bannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#38BDF8',
  },
  bannerDesc: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#1E293B',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 12,
  },
  statValue: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  emptyAddBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  addDashedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(56, 189, 248, 0.4)',
    backgroundColor: 'rgba(56, 189, 248, 0.04)',
    marginTop: 8,
    gap: 8,
  },
  addDashedText: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '600',
  },
});
