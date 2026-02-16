import React, { useState, useEffect, memo } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
// Adjusted width calculation for better spacing
const cardWidth = (width - 48) / 2;

interface WordSet {
  id?: number;
  set_id?: number;
  name?: string;
  set_name?: string;
  difficulty?: string;
  category?: string;
  total?: number;
  progress?: number;
  learned_count?: number;
  color?: string;
  hasData?: boolean;
}

interface WordSetCardProps {
  wordSet: WordSet;
  onPress: () => void;
  index?: number;
}

interface DifficultyConfig {
  name: string;
  colors: readonly [string, string, ...string[]];
  icon: string;
}

const WordSetCard: React.FC<WordSetCardProps> = memo(({ wordSet, onPress, index = 0 }) => {
  const [scaleValue] = useState(new Animated.Value(1));
  const [fadeValue] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeValue, {
      toValue: 1,
      duration: 400,
      delay: index * 100, // Staggered animation
      useNativeDriver: true,
    }).start();
  }, [index, fadeValue]);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getDifficultyConfig = (difficulty?: string): DifficultyConfig => {
    const configs: Record<string, DifficultyConfig> = {
      'A1': { name: 'Başlangıç', colors: ['#10B981', '#34D399'], icon: 'feather' },
      'A2': { name: 'Temel', colors: ['#3B82F6', '#60A5FA'], icon: 'droplet' },
      'B1': { name: 'Orta', colors: ['#F59E0B', '#FBBF24'], icon: 'trending-up' },
      'B2': { name: 'Orta-İleri', colors: ['#EF4444', '#F87171'], icon: 'activity' },
      'C1': { name: 'İleri', colors: ['#8B5CF6', '#A78BFA'], icon: 'zap' },
      'C2': { name: 'Uzman', colors: ['#EC4899', '#F472B6'], icon: 'award' }
    };
    return configs[difficulty || ''] || { name: 'Genel', colors: ['#6B7280', '#9CA3AF'], icon: 'book' };
  };

  const setName = wordSet.name || 'Kelime Seti';
  const difficultyConfig = getDifficultyConfig(wordSet.category || wordSet.difficulty);
  const progress = wordSet.progress || 0;
  const isCompleted = progress === 100;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleValue }],
          opacity: fadeValue,
        }
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.touchable}
      >
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.85)', 'rgba(255, 255, 255, 0.5)']}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Header Icon Section */}
          <View style={styles.header}>
            <LinearGradient
              colors={difficultyConfig.colors}
              style={styles.iconContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Feather name={difficultyConfig.icon as any} size={20} color="white" />
            </LinearGradient>

            {isCompleted ? (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              </View>
            ) : (
              <View style={styles.difficultyBadge}>
                <Text style={[styles.difficultyText, { color: difficultyConfig.colors[0] }]}>
                  {difficultyConfig.name}
                </Text>
              </View>
            )}
          </View>

          {/* Title Section */}
          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={2}>{setName}</Text>
            <Text style={styles.subtitle}>
              {wordSet.total ? `${wordSet.total} Kelime` : 'Detaylar'}
            </Text>
          </View>

          {/* Progress Section */}
          <View style={styles.footer}>
            {wordSet.hasData ? (
              <View style={styles.progressContainer}>
                <View style={styles.progressLabelRow}>
                  <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
                  <Text style={styles.progressLabel}>Öğrenildi</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <LinearGradient
                    colors={difficultyConfig.colors}
                    style={[styles.progressBarFill, { width: `${progress}%` }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                </View>
              </View>
            ) : (
              <View style={styles.startAction}>
                <Text style={[styles.startText, { color: difficultyConfig.colors[0] }]}>Başla</Text>
                <Feather name="arrow-right" size={16} color={difficultyConfig.colors[0]} />
              </View>
            )}
          </View>

        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    height: 190, // Slightly taller for better spacing
    marginBottom: 16,
    marginHorizontal: 8,
    borderRadius: 24,
  },
  touchable: {
    flex: 1,
    borderRadius: 24,
  },
  cardGradient: {
    flex: 1,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  difficultyBadge: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '700',
  },
  completedBadge: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
    lineHeight: 22,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  footer: {
    marginTop: 12,
  },
  progressContainer: {
    width: '100%',
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    alignItems: 'flex-end',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
  },
  progressLabel: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  startAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 8,
    gap: 4,
  },
  startText: {
    fontSize: 13,
    fontWeight: '600',
  }
});

export default WordSetCard;
