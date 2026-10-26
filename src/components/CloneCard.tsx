import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ClonedApp } from '../types';
import { Play, Snowflake, Trash2, ShieldCheck, Box } from 'lucide-react-native';

interface Props {
  clone: ClonedApp;
  onLaunch: (clone: ClonedApp) => void;
  onToggleFreeze: (clone: ClonedApp) => void;
  onRemove: (clone: ClonedApp) => void;
}

export const CloneCard: React.FC<Props> = ({
  clone,
  onLaunch,
  onToggleFreeze,
  onRemove,
}) => {
  return (
    <View style={[styles.card, clone.isFrozen && styles.cardFrozen]}>
      <View style={styles.topRow}>
        <View style={styles.iconWrapper}>
          {clone.icon ? (
            <Image source={{ uri: clone.icon }} style={styles.appIcon} />
          ) : (
            <View style={styles.fallbackIcon}>
              <Box size={24} color="#38BDF8" />
            </View>
          )}
          {/* Work / Isolation Badge */}
          <View style={styles.badge}>
            <ShieldCheck size={11} color="#0284C7" />
          </View>
        </View>

        <View style={styles.metaContainer}>
          <Text style={styles.appName} numberOfLines={1}>
            {clone.appName}
          </Text>
          <View style={styles.tagRow}>
            <View style={styles.cloneBadge}>
              <Text style={styles.cloneBadgeText}>{clone.cloneName}</Text>
            </View>
            {clone.isFrozen ? (
              <View style={[styles.statusBadge, styles.statusFrozen]}>
                <Snowflake size={10} color="#38BDF8" />
                <Text style={styles.statusTextFrozen}>Frozen</Text>
              </View>
            ) : (
              <View style={[styles.statusBadge, styles.statusActive]}>
                <View style={styles.activeDot} />
                <Text style={styles.statusTextActive}>Isolated</Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity
          onPress={() => onRemove(clone)}
          style={styles.deleteBtn}
          accessibilityLabel="Remove clone">
          <Trash2 size={16} color="#64748B" />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.actionsRow}>
        <TouchableOpacity
          onPress={() => onToggleFreeze(clone)}
          style={[styles.actionBtn, styles.freezeBtn]}>
          <Snowflake size={14} color={clone.isFrozen ? '#38BDF8' : '#94A3B8'} />
          <Text style={[styles.actionText, clone.isFrozen && styles.actionTextActive]}>
            {clone.isFrozen ? 'Unfreeze' : 'Freeze'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onLaunch(clone)}
          style={[styles.actionBtn, styles.launchBtn]}>
          <Play size={14} color="#FFFFFF" fill="#FFFFFF" />
          <Text style={styles.launchBtnText}>Launch Space</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardFrozen: {
    opacity: 0.75,
    borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  appIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  fallbackIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  badge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#1E293B',
  },
  metaContainer: {
    flex: 1,
  },
  appName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cloneBadge: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  cloneBadgeText: {
    color: '#C084FC',
    fontSize: 11,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  statusActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
  },
  statusFrozen: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  statusTextActive: {
    fontSize: 11,
    color: '#4ADE80',
    fontWeight: '600',
  },
  statusTextFrozen: {
    fontSize: 11,
    color: '#38BDF8',
    fontWeight: '600',
  },
  deleteBtn: {
    padding: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 6,
  },
  freezeBtn: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    flex: 1,
  },
  actionText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  actionTextActive: {
    color: '#38BDF8',
  },
  launchBtn: {
    backgroundColor: '#0284C7',
    flex: 1.4,
  },
  launchBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
