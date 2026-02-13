import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
// @ts-ignore
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

interface StudyActionModalProps {
    isVisible: boolean;
    onClose: () => void;
    title: string;
    message: string;
    primaryButtonText: string;
    onPrimaryPress: () => void;
    secondaryButtonText: string;
    onSecondaryPress: () => void;
    stats?: {
        learned: number;
        total: number;
    };
    color?: string;
    icon?: string;
}

const StudyActionModal: React.FC<StudyActionModalProps> = ({
    isVisible,
    onClose,
    title,
    message,
    primaryButtonText,
    onPrimaryPress,
    secondaryButtonText,
    onSecondaryPress,
    stats,
    color = "#3B82F6",
    icon = "trophy-outline"
}) => {
    const scaleValue = new Animated.Value(0);
    const opacityValue = new Animated.Value(0);

    useEffect(() => {
        if (isVisible) {
            Animated.parallel([
                Animated.spring(scaleValue, {
                    toValue: 1,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityValue, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            scaleValue.setValue(0);
            opacityValue.setValue(0);
        }
    }, [isVisible]);

    return (
        <Modal
            transparent
            visible={isVisible}
            animationType="none"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Animated.View style={[styles.backdrop, { opacity: opacityValue }]}>
                    <TouchableOpacity activeOpacity={1} style={{ flex: 1 }} onPress={onClose} />
                </Animated.View>

                <Animated.View
                    style={[
                        styles.modalContainer,
                        {
                            opacity: opacityValue,
                            transform: [{ scale: scaleValue }]
                        }
                    ]}
                >
                    <LinearGradient
                        colors={['rgba(255,255,255,0.98)', 'rgba(248,250,252,0.95)']}
                        style={styles.gradient}
                    >
                        <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
                            <Icon name={icon} size={44} color={color} />
                        </View>

                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.message}>{message}</Text>

                        {stats && (
                            <View style={styles.statsContainer}>
                                <View style={styles.statItem}>
                                    <Text style={[styles.statValue, { color: color }]}>{stats.learned}</Text>
                                    <Text style={styles.statLabel}>Öğrenilen</Text>
                                </View>
                                <View style={styles.statDivider} />
                                <View style={styles.statItem}>
                                    <Text style={styles.statValue}>{stats.total}</Text>
                                    <Text style={styles.statLabel}>Toplam</Text>
                                </View>
                            </View>
                        )}

                        <View style={styles.buttonStack}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={onPrimaryPress}
                                style={styles.primaryButton}
                            >
                                <LinearGradient
                                    colors={[color, color]} // Adjust for depth if needed
                                    style={styles.primaryGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    <Text style={styles.primaryButtonText}>{primaryButtonText}</Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                                activeOpacity={0.6}
                                onPress={onSecondaryPress}
                                style={styles.secondaryButton}
                            >
                                <Text style={styles.secondaryButtonText}>{secondaryButtonText}</Text>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
    },
    modalContainer: {
        width: width * 0.88,
        borderRadius: 32,
        overflow: 'hidden',
        elevation: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
    },
    gradient: {
        padding: 30,
        alignItems: 'center',
    },
    iconBox: {
        width: 80,
        height: 80,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: '#0F172A',
        textAlign: 'center',
        marginBottom: 8,
    },
    message: {
        fontSize: 15,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(241, 245, 249, 0.6)',
        borderRadius: 20,
        padding: 20,
        width: '100%',
        marginBottom: 30,
        borderWidth: 1,
        borderColor: 'rgba(226, 232, 240, 0.5)',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1E293B',
    },
    statLabel: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '600',
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        height: '100%',
        backgroundColor: '#E2E8F0',
    },
    buttonStack: {
        width: '100%',
        gap: 12,
    },
    primaryButton: {
        width: '100%',
        borderRadius: 18,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    primaryGradient: {
        paddingVertical: 18,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    secondaryButton: {
        width: '100%',
        paddingVertical: 16,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#64748B',
        fontSize: 15,
        fontWeight: '600',
    },
});

export default StudyActionModal;
