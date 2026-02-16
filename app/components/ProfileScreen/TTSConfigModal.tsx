import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, Dimensions, StyleSheet, Pressable } from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import ttsService from '../../services/TextToSpeechService';

const { height } = Dimensions.get('window');

interface TTSConfigModalProps {
    visible: boolean;
    onClose: () => void;
}

const TTSConfigModal: React.FC<TTSConfigModalProps> = ({ visible, onClose }) => {
    const [rate, setRate] = useState(1.0);
    const [pitch, setPitch] = useState(1.0);

    // Modal açıldığında mevcut ayarları yükle
    useEffect(() => {
        if (visible) {
            setRate(ttsService.getRate());
            setPitch(ttsService.getPitch());
        }
    }, [visible]);

    const handleSave = async () => {
        await ttsService.saveSettings({ rate, pitch });
        onClose();
    };

    const handleTest = async () => {
        // Geçici olarak ayarları uygula ve test et
        ttsService.updateDefaultOptions({ rate, pitch });
        await ttsService.speakEnglishWord("Hello, this is a test of your speech settings.");
    };

    const handleReset = () => {
        setRate(1.0);
        setPitch(1.0);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Pressable style={styles.backdrop} onPress={onClose} />

                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Ses Ayarları</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={20} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        {/* Speed Control */}
                        <View style={styles.controlGroup}>
                            <View style={styles.labelContainer}>
                                <Text style={styles.label}>Okuma Hızı</Text>
                                <Text style={styles.valueText}>{rate.toFixed(1)}x</Text>
                            </View>
                            <Slider
                                style={styles.slider}
                                minimumValue={0.5}
                                maximumValue={1.5}
                                step={0.1}
                                value={rate}
                                onValueChange={setRate}
                                minimumTrackTintColor="#10B981"
                                maximumTrackTintColor="#D1D5DB"
                                thumbTintColor="#10B981"
                            />
                            <View style={styles.sliderLabels}>
                                <Text style={styles.minMaxLabel}>Yavaş</Text>
                                <Text style={styles.minMaxLabel}>Hızlı</Text>
                            </View>
                        </View>

                        {/* Pitch Control */}
                        <View style={styles.controlGroup}>
                            <View style={styles.labelContainer}>
                                <Text style={styles.label}>Ses Tonu</Text>
                                <Text style={styles.valueText}>{pitch.toFixed(1)}x</Text>
                            </View>
                            <Slider
                                style={styles.slider}
                                minimumValue={0.5}
                                maximumValue={1.5}
                                step={0.1}
                                value={pitch}
                                onValueChange={setPitch}
                                minimumTrackTintColor="#3B82F6"
                                maximumTrackTintColor="#D1D5DB"
                                thumbTintColor="#3B82F6"
                            />
                            <View style={styles.sliderLabels}>
                                <Text style={styles.minMaxLabel}>Kalın</Text>
                                <Text style={styles.minMaxLabel}>İnce</Text>
                            </View>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.actions}>

                            <TouchableOpacity style={styles.testButton} onPress={handleTest}>
                                <Ionicons name="play-circle-outline" size={20} color="#6366F1" />
                                <Text style={styles.testButtonText}>Test Et</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                                <Text style={styles.resetButtonText}>Varsayılan</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                            <Text style={styles.saveButtonText}>Kaydet</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    modalContent: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        position: 'relative',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    closeButton: {
        position: 'absolute',
        right: 16,
        padding: 4,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
    },
    content: {
        padding: 24,
    },
    controlGroup: {
        marginBottom: 24,
    },
    labelContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    valueText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#6B7280',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    sliderLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
    },
    minMaxLabel: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    testButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EEF2FF',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 12,
        flex: 1,
        marginRight: 8,
        justifyContent: 'center',
    },
    testButtonText: {
        color: '#6366F1',
        fontWeight: '600',
        marginLeft: 6,
    },
    resetButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
    },
    resetButtonText: {
        color: '#6B7280',
        fontWeight: '500',
    },
    saveButton: {
        backgroundColor: '#10B981',
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: 'center',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default TTSConfigModal;
