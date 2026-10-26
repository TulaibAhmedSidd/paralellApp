import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { InstalledApp } from '../types';
import { AppListItem } from '../components/AppListItem';
import { Search, X, Layers } from 'lucide-react-native';

interface Props {
  installedApps: InstalledApp[];
  clonedPackageNames: Set<string>;
  onCloneApp: (app: InstalledApp) => void;
  isLoading: boolean;
}

export const AddCloneScreen: React.FC<Props> = ({
  installedApps,
  clonedPackageNames,
  onCloneApp,
  isLoading,
}) => {
  const [search, setSearch] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'social' | 'games'>('all');

  const filteredApps = installedApps.filter(app => {
    const matchesSearch =
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.packageName.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterCategory === 'social') {
      const pkg = app.packageName.toLowerCase();
      return (
        pkg.includes('whatsapp') ||
        pkg.includes('telegram') ||
        pkg.includes('instagram') ||
        pkg.includes('facebook') ||
        pkg.includes('twitter') ||
        pkg.includes('discord') ||
        pkg.includes('snapchat') ||
        app.category === 'social' ||
        app.category === 'messaging'
      );
    }

    if (filterCategory === 'games') {
      const pkg = app.packageName.toLowerCase();
      return pkg.includes('game') || pkg.includes('pubg') || app.category === 'gaming';
    }

    return true;
  });

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Search size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search installed apps..."
            placeholderTextColor="#64748B"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <X size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Pills */}
      <View style={styles.categoryRow}>
        <TouchableOpacity
          style={[styles.pill, filterCategory === 'all' && styles.pillActive]}
          onPress={() => setFilterCategory('all')}>
          <Text style={[styles.pillText, filterCategory === 'all' && styles.pillTextActive]}>
            All Apps ({installedApps.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.pill, filterCategory === 'social' && styles.pillActive]}
          onPress={() => setFilterCategory('social')}>
          <Text style={[styles.pillText, filterCategory === 'social' && styles.pillTextActive]}>
            Social & Chat
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.pill, filterCategory === 'games' && styles.pillActive]}
          onPress={() => setFilterCategory('games')}>
          <Text style={[styles.pillText, filterCategory === 'games' && styles.pillTextActive]}>
            Games
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredApps}
        keyExtractor={item => item.packageName}
        renderItem={({ item }) => (
          <AppListItem
            app={item}
            isAlreadyCloned={clonedPackageNames.has(item.packageName)}
            onClone={onCloneApp}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Layers size={36} color="#64748B" />
            <Text style={styles.emptyTitle}>
              {isLoading ? 'Scanning installed apps...' : 'No Apps Found'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {search.length > 0
                ? 'Try a different search keyword.'
                : 'Installed apps on this device will be listed here.'}
            </Text>
          </View>
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
  searchRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: '#F8FAFC',
    fontSize: 14,
    marginLeft: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 10,
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  pillActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: '#38BDF8',
  },
  pillText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#38BDF8',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySubtitle: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 4,
  },
});
