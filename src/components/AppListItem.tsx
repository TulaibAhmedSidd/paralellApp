import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { InstalledApp } from '../types';
import { Plus, Check, Box } from 'lucide-react-native';

interface Props {
  app: InstalledApp;
  isAlreadyCloned: boolean;
  onClone: (app: InstalledApp) => void;
}

export const AppListItem: React.FC<Props> = ({
  app,
  isAlreadyCloned,
  onClone,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        {app.icon ? (
          <Image source={{ uri: app.icon }} style={styles.appIcon} />
        ) : (
          <View style={styles.fallbackIcon}>
            <Box size={22} color="#94A3B8" />
          </View>
        )}
        <View style={styles.meta}>
          <Text style={styles.appName} numberOfLines={1}>
            {app.name}
          </Text>
          <Text style={styles.pkgName} numberOfLines={1}>
            {app.packageName}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => onClone(app)}
        disabled={isAlreadyCloned}
        style={[styles.cloneBtn, isAlreadyCloned && styles.clonedBtn]}>
        {isAlreadyCloned ? (
          <>
            <Check size={14} color="#22C55E" />
            <Text style={styles.clonedText}>Cloned</Text>
          </>
        ) : (
          <>
            <Plus size={14} color="#FFFFFF" />
            <Text style={styles.cloneText}>Clone</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  appIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    marginRight: 12,
  },
  fallbackIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  meta: {
    flex: 1,
  },
  appName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  pkgName: {
    fontSize: 11,
    color: '#64748B',
  },
  cloneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284C7',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  clonedBtn: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  cloneText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  clonedText: {
    color: '#4ADE80',
    fontSize: 12,
    fontWeight: '600',
  },
});
