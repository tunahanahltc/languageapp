import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { PracticeStackParamList } from '../types';
import Background from '../components/shared/Background';
import { useTheme } from '../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

type GameScreenRouteProp = RouteProp<PracticeStackParamList, 'GameScreen'>;

const GameScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<GameScreenRouteProp>();
    const { gameId, gameTitle, gameType, wordSet, themeColors: paramThemeColors } = route.params;
    const { themeColors } = useTheme();
    const colors = paramThemeColors || themeColors;

    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [isPlaying, setIsPlaying] = useState(false);

    // Animation values
    const fadeAnim = new Animated.Value(0);
    const scaleAnim = new Animated.Value(0.9);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleBack = () => {
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <Background colors={colors}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={28} color="white" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>{gameTitle}</Text>
                        <Text style={styles.headerSubtitle}>{wordSet} Modu</Text>
                    </View>
                    <View style={styles.scoreContainer}>
                        <Text style={styles.scoreLabel}>PUAN</Text>
                        <Text style={styles.scoreValue}>{score}</Text>
                    </View>
                </View>

                {/* Game Area */}
                <Animated.View
                    style={[
                        styles.gameArea,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }]
                        }
                    ]}
                >
                    <View style={styles.placeholderContent}>
                        <LinearGradient
                            colors={['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.4)']}
                            style={styles.iconContainer}
                        >
                            <FontAwesome5 name="gamepad" size={64} color={colors[0]} />
                        </LinearGradient>
                        <Text style={styles.placeholderText}>
                            {gameTitle} Hazırlanıyor...
                        </Text>
                        <Text style={styles.placeholderSubText}>
                            Çok yakında burada harika bir oyun deneyimi seni bekliyor!
                        </Text>

                        <TouchableOpacity
                            style={styles.demoButton}
                            onPress={() => setScore(s => s + 10)}
                        >
                            <LinearGradient
                                colors={['#F59E0B', '#D97706']}
                                style={styles.demoButtonGradient}
                            >
                                <Text style={styles.demoButtonText}>Puan Kazan (Demo)</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* Footer / Controls */}
                <View style={styles.footer}>
                    <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBar, { width: '60%', backgroundColor: 'white' }]} />
                    </View>
                    <Text style={styles.progressText}>İlerleme: %60</Text>
                </View>

            </Background>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    headerSubtitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
    },
    scoreContainer: {
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    scoreLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: 'rgba(255,255,255,0.7)',
    },
    scoreValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFD700',
    },
    gameArea: {
        flex: 1,
        marginHorizontal: 20,
        marginBottom: 20,
        backgroundColor: 'white',
        borderRadius: 32,
        padding: 4, // for border effect
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
        overflow: 'hidden',
    },
    placeholderContent: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 8,
    },
    placeholderText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1E293B',
        textAlign: 'center',
        marginBottom: 12,
    },
    placeholderSubText: {
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
    },
    demoButton: {
        width: '100%',
        borderRadius: 16,
        shadowColor: "#F59E0B",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    demoButtonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        borderRadius: 16,
    },
    demoButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    footer: {
        paddingHorizontal: 30,
        paddingBottom: 40,
    },
    progressBarContainer: {
        height: 8,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
    progressText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 4,
    }
});

export default GameScreen;
