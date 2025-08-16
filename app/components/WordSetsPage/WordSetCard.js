import React, { useState, useEffect, memo } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 16px padding + 8px margin per side

const WordSetCard = memo(function WordSetCard({ wordSet, onPress, index = 0 }) {
  const [wordCount, setWordCount] = useState(0);
  const [scaleValue] = useState(new Animated.Value(1));
  const [fadeValue] = useState(new Animated.Value(0));
  const [rotateValue] = useState(new Animated.Value(0));
  const [elevationValue] = useState(new Animated.Value(1));

  useEffect(() => {
    // Staggered animation for card entrance
    Animated.timing(fadeValue, {
      toValue: 1,
      duration: 300,
      delay: index * 100,
      useNativeDriver: true,
    }).start();

    if (wordSet.total !== undefined) {
      setWordCount(wordSet.total);
    } else {
      setWordCount(0);
    }
  }, [wordSet.total, index, fadeValue]);

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 0.96,
        useNativeDriver: true,
      }),
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(elevationValue, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(rotateValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(elevationValue, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = () => {
    console.log('WordSetCard pressed:', wordSet?.name);
    if (onPress) {
      onPress();
    }
  };

  if (!wordSet) {
    return null;
  }

  const getDifficultyConfig = (difficulty) => {
    const configs = {
      'A1': { name: 'Başlangıç', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)' },
      'A2': { name: 'Temel', color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.1)' },
      'B1': { name: 'Orta', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)' },
      'B2': { name: 'Orta-İleri', color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
      'C1': { name: 'İleri', color: '#8B5CF6', bgColor: 'rgba(139, 92, 246, 0.1)' },
      'C2': { name: 'Profesyonel', color: '#EC4899', bgColor: 'rgba(236, 72, 153, 0.1)' }
    };
    return configs[difficulty] || { name: 'Genel', color: '#6B7280', bgColor: 'rgba(107, 114, 128, 0.1)' };
  };

  const setName = wordSet.name || 'Kelime Seti';
  const firstChar = setName.charAt(0).toUpperCase() || 'K';
  const difficultyConfig = getDifficultyConfig(wordSet.category);
  const progress = wordSet.progress || 0;

  return (
    <Animated.View 
      style={[
        { 
          transform: [
            { scale: scaleValue },
            {
              rotate: rotateValue.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '0.5deg']
              })
            }
          ],
          opacity: fadeValue,
          shadowOpacity: elevationValue.interpolate({
            inputRange: [1, 1.1],
            outputRange: [0.12, 0.24]
          })
        }
      ]}
    >
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={1}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {/* Glassmorphism background */}
        <View style={styles.glassBackground} />
        
        <View style={styles.cardContent}>
          {/* Modern icon with gradient-like effect */}
          <View style={[styles.iconContainer, { backgroundColor: wordSet.color || difficultyConfig.color }]}>
            <View style={styles.iconInner}>
              <Text style={styles.iconText}>{firstChar}</Text>
            </View>
            <View style={[styles.iconGlow, { backgroundColor: wordSet.color || difficultyConfig.color }]} />
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.setName} numberOfLines={2}>{setName}</Text>
            <Text style={styles.setSubtitle}>Kelime seti</Text>
          </View>

          <View style={styles.bottomSection}>
            {/* Modern difficulty badge */}
            <View style={[styles.difficultyBadge, { backgroundColor: difficultyConfig.bgColor }]}>
              <View style={[styles.difficultyDot, { backgroundColor: difficultyConfig.color }]} />
              <Text style={[styles.difficultyText, { color: difficultyConfig.color }]}>
                {difficultyConfig.name}
              </Text>
            </View>
            
            {/* Progress section */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <View style={styles.starContainer}>
                  <Text style={styles.starEmoji}>⭐</Text>
                </View>
                <Text style={styles.progressText}>{progress}%</Text>
              </View>
              
              {/* Modern progress bar */}
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBg}>
                  <Animated.View 
                    style={[
                      styles.progressBarFill, 
                      { 
                        backgroundColor: wordSet.color || difficultyConfig.color,
                        width: `${progress}%` 
                      }
                    ]} 
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    height: 200,
    marginBottom: 16,
    marginHorizontal: 8,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  glassBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
  },
  cardContent: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    height: '100%',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInner: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  iconGlow: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 16,
    opacity: 0.3,
    transform: [{ scale: 1.1 }],
  },
  iconText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  textContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  setName: {
    fontWeight: '700',
    color: '#1F2937',
    fontSize: 14,
    marginBottom: 4,
    letterSpacing: -0.3,
    textAlign: 'center',
    lineHeight: 18,
  },
  setSubtitle: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 8,
  },
  difficultyDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 5,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
   progressSection: {
     alignItems: 'center',
     width: '100%',
   },
   progressHeader: {
     flexDirection: 'row',
     alignItems: 'center',
     marginBottom: 4,
   },
   starContainer: {
     width: 16,
     height: 16,
     alignItems: 'center',
     justifyContent: 'center',
   },
   starEmoji: {
     fontSize: 12,
   },
   progressText: {
     marginLeft: 4,
     color: '#F59E0B',
     fontWeight: '700',
     fontSize: 11,
     letterSpacing: -0.3,
   },
   progressBarContainer: {
     alignItems: 'center',
     width: '100%',
   },
   progressBarBg: {
     width: '100%',
     height: 6,
     backgroundColor: '#F3F4F6',
     borderRadius: 4,
     overflow: 'hidden',
   },
   progressBarFill: {
     height: 6,
     borderRadius: 4,
     minWidth: 6,
   },

});

export default WordSetCard;