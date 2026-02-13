import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
// @ts-ignore
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

interface SuccessModalProps {
    isVisible: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
    buttonText?: string;
    color?: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
    isVisible,
    onClose,
    title = "Başarıyla Başlatıldı!",
    message = "Yeni kelime setin başarıyla hazırlandı. Harika bir öğrenme yolculuğu seni bekliyor! ✨",
    buttonText = "Maceraya Başla",
    color = "#10B981"
}) => {
    const scaleAnim = new Animated.Value(0);
    const opacityAnim = new Animated.Value(0);

    useEffect(() => {
        if (isVisible) {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            scaleAnim.setValue(0);
            opacityAnim.setValue(0);
        }
    }, [isVisible]);

    const handleClose = () => {
        Animated.parallel([
            Animated.timing(scaleAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => onClose());
    };

    return (
        <Modal
            transparent
            visible={isVisible}
            animationType="none"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <Animated.View style={[styles.backdrop, { opacity: opacityAnim }]}>
                    <TouchableOpacity activeOpacity={1} style={styles.backdropTouch} onPress={handleClose} />
                </Animated.View>

                <Animated.View
                    style={[
                        styles.modalContainer,
                        {
                            opacity: opacityAnim,
                            transform: [{ scale: scaleAnim }]
                        }
                    ]}
                >
                    <LinearGradient
                        colors={['rgba(255,255,255,0.95)', 'rgba(240,249,255,0.9)']}
                        style={styles.gradient}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                            <View style={[styles.iconInner, { backgroundColor: color }]}>
                                <Icon name="checkmark-circle" size={50} color="#fff" />
                            </View>
                        </View>

                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.message}>{message}</Text>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={handleClose}
                            style={styles.button}
                        >
                            <LinearGradient
                                colors={[color, color]} // Gradient can be adjusted for depth
                                style={styles.buttonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Text style={styles.buttonText}>{buttonText}</Text>
                                <Icon name="arrow-forward" size={18} color="#fff" style={styles.buttonIcon} />
                            </LinearGradient>
                        </TouchableOpacity>
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
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    backdropTouch: {
        flex: 1,
    },
    modalContainer: {
        width: width * 0.85,
        borderRadius: 32,
        overflow: 'hidden',
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    gradient: {
        padding: 32,
        alignItems: 'center',
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    iconInner: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 12,
    },
    message: {
        fontSize: 15,
        color: '#4B5563',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 28,
    },
    button: {
        width: '100%',
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
    },
    buttonGradient: {
        flexDirection: 'row',
        paddingVertical: 18,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    buttonIcon: {
        marginLeft: 10,
    },
});

export default SuccessModal;
