import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

export default function WordSetCard({ wordSet, categories, onPress }) {
  const handlePress = () => {
    console.log('WordSetCard pressed:', wordSet.name);
    if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={handlePress}>
      <View style={styles.cardRow}>
        <View style={styles.cardLeft}>
          <View style={[styles.iconBox, { backgroundColor: wordSet.color }]}> 
            <Text style={styles.iconText}>{wordSet.name.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.setName}>{wordSet.name}</Text>
            <Text style={styles.setTotal}>{wordSet.total} kelime</Text>
            {/* Kategori etiketi */}
            <View style={styles.categoryTag}>
              <Text style={styles.categoryText}>
                {categories.find(cat => cat.id === wordSet.category)?.name || wordSet.category}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.cardRight}>
          <View style={{ alignItems: 'flex-end' }}>
            <View style={styles.progressRow}>
              <Text style={styles.starEmoji}>⭐</Text>
              <Text style={styles.progressText}>{wordSet.progress}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { backgroundColor: wordSet.color, width: `${wordSet.progress}%` }]} />
            </View>
          </View>
          <Text style={styles.chevronEmoji}>❯</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },
  setName: {
    fontWeight: '600',
    color: '#1e293b',
    fontSize: 16,
  },
  setTotal: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 2,
  },
  categoryTag: {
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  categoryText: {
    color: '#4A90E2',
    fontSize: 11,
    fontWeight: '500',
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  progressText: {
    marginLeft: 4,
    color: '#facc15',
    fontWeight: '500',
    fontSize: 13,
  },
  starEmoji: {
    fontSize: 16,
  },
  chevronEmoji: {
    fontSize: 20,
    color: '#9ca3af',
    marginLeft: 12,
  },
  progressBarBg: {
    width: 64,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginTop: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    borderRadius: 4,
  },
});
