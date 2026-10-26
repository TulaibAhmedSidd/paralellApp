import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Lock, Delete } from 'lucide-react-native';

interface Props {
  visible: boolean;
  onUnlock: () => void;
  correctPin?: string;
}

export const VaultLockModal: React.FC<Props> = ({
  visible,
  onUnlock,
  correctPin = '1234',
}) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  const handleKeyPress = (num: string) => {
    setPin(prev => {
      if (prev.length >= 4) return prev;
      const nextPin = prev + num;
      setError(false);

      if (nextPin.length === 4) {
        if (nextPin === correctPin) {
          setTimeout(() => {
            setPin('');
            onUnlock();
          }, 150);
        } else {
          setError(true);
          setTimeout(() => {
            setPin('');
          }, 600);
        }
      }
      return nextPin;
    });
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={[styles.iconCircle, error && styles.iconError]}>
            <Lock size={32} color={error ? '#F43F5E' : '#38BDF8'} />
          </View>
          <Text style={styles.title}>Parallel Vault Locked</Text>
          <Text style={styles.subtitle}>
            Enter 4-digit PIN to access isolated accounts
          </Text>
          <Text style={styles.hint}>Default PIN: 1234</Text>
        </View>

        {/* PIN dots */}
        <View style={styles.dotsRow}>
          {[0, 1, 2, 3].map(i => {
            const isFilled = pin.length > i;
            return (
              <View
                key={i}
                style={[
                  styles.dot,
                  isFilled && styles.dotFilled,
                  error && styles.dotError,
                ]}
              />
            );
          })}
        </View>

        {error && <Text style={styles.errorText}>Incorrect PIN. Try 1234</Text>}

        {/* Keypad */}
        <View style={styles.keypad}>
          {[
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
            ['', '0', 'del'],
          ].map((row, rIdx) => (
            <View key={rIdx} style={styles.keyRow}>
              {row.map((item, cIdx) => {
                if (item === '') {
                  return <View key={cIdx} style={styles.keyPlaceholder} />;
                }
                if (item === 'del') {
                  return (
                    <TouchableOpacity
                      key={cIdx}
                      style={styles.keyButton}
                      onPress={handleDelete}>
                      <Delete size={24} color="#94A3B8" />
                    </TouchableOpacity>
                  );
                }
                return (
                  <TouchableOpacity
                    key={cIdx}
                    testID={`keypad-${item}`}
                    style={styles.keyButton}
                    onPress={() => handleKeyPress(item)}>
                    <Text style={styles.keyText}>{item}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'space-between',
    paddingVertical: 50,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  iconError: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderColor: 'rgba(244, 63, 94, 0.4)',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  hint: {
    fontSize: 12,
    color: '#38BDF8',
    marginTop: 6,
    fontWeight: '600',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginVertical: 20,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#334155',
  },
  dotFilled: {
    backgroundColor: '#38BDF8',
    borderColor: '#38BDF8',
  },
  dotError: {
    backgroundColor: '#F43F5E',
    borderColor: '#F43F5E',
  },
  errorText: {
    color: '#F43F5E',
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
  },
  keypad: {
    marginBottom: 20,
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  keyButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  keyPlaceholder: {
    width: 76,
    height: 76,
  },
  keyText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#F8FAFC',
  },
});
