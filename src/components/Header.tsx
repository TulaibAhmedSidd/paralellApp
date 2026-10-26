import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Shield, Sparkles, Lock, RefreshCw } from 'lucide-react-native';

interface Props {
  activeTab: 'home' | 'library' | 'engine';
  onTabChange: (tab: 'home' | 'library' | 'engine') => void;
  isLocked: boolean;
  onToggleLock: () => void;
  onRefresh?: () => void;
}

export const Header: React.FC<Props> = ({
  activeTab,
  onTabChange,
  isLocked,
  onToggleLock,
  onRefresh,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.titleContainer}>
          <View style={styles.iconBadge}>
            <Sparkles size={20} color="#38BDF8" />
          </View>
          <View>
            <Text style={styles.title}>Parallel Space</Text>
            <Text style={styles.subtitle}>Dual Sandbox Container</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          {onRefresh && (
            <TouchableOpacity onPress={onRefresh} style={styles.iconButton}>
              <RefreshCw size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onToggleLock} style={[styles.iconButton, isLocked && styles.lockedBtn]}>
            <Lock size={18} color={isLocked ? '#F43F5E' : '#38BDF8'} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.navRow}>
        <TouchableOpacity
          style={[styles.navTab, activeTab === 'home' && styles.navTabActive]}
          onPress={() => onTabChange('home')}>
          <Text style={[styles.navText, activeTab === 'home' && styles.navTextActive]}>
            My Clones
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navTab, activeTab === 'library' && styles.navTabActive]}
          onPress={() => onTabChange('library')}>
          <Text style={[styles.navText, activeTab === 'library' && styles.navTextActive]}>
            Add Apps (+)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navTab, activeTab === 'engine' && styles.navTabActive]}
          onPress={() => onTabChange('engine')}>
          <View style={styles.engineTabRow}>
            <Shield size={14} color={activeTab === 'engine' ? '#38BDF8' : '#64748B'} />
            <Text style={[styles.navText, activeTab === 'engine' && styles.navTextActive, { marginLeft: 5 }]}>
              Engine & Isolation
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    paddingTop: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedBtn: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.4)',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navTab: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  navTabActive: {
    backgroundColor: '#1E293B',
    borderBottomWidth: 2,
    borderBottomColor: '#38BDF8',
  },
  navText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  navTextActive: {
    color: '#38BDF8',
  },
  engineTabRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
