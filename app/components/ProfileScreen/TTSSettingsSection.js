import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  ScrollView,
  Modal,
  Alert,
  StyleSheet,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { useTheme } from '../../contexts/ThemeContext';
import ttsService from '../../services/TextToSpeechService';
import TTSPreferencesService from '../../services/TTSPreferencesService';

const TTSSettingsSection = () => {
  const { themeColors } = useTheme();
  const [voiceSelectionModalVisible, setVoiceSelectionModalVisible] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [currentSpeed, setCurrentSpeed] = useState(0.8);
  const [autoReadMeaning, setAutoReadMeaning] = useState(false);
  const [autoReadExample, setAutoReadExample] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedEnglishVoice, setSelectedEnglishVoice] = useState(null);
  const [selectedTurkishVoice, setSelectedTurkishVoice] = useState(null);

  useEffect(() => {
    loadAvailableVoices();
  }, []);

  useEffect(() => {
    if (availableVoices.length > 0) {
      loadPreferences();
    }
  }, [availableVoices]);

  const loadPreferences = async () => {
    try {
      const preferences = await TTSPreferencesService.loadPreferences();
      setTtsEnabled(preferences.enabled);
      setCurrentSpeed(preferences.speed);
      setAutoReadMeaning(preferences.autoReadMeaning);
      setAutoReadExample(preferences.autoReadExample);
      
      // Default voice ayarlarını uygula
      ttsService.setSpeed(preferences.speed);
      ttsService.setEnabled(preferences.enabled);
      
      // Seçili sesleri yükle ve TTS servisine ayarla
      let englishVoice = null;
      let turkishVoice = null;
      
      if (preferences.selectedEnglishVoice) {
        englishVoice = availableVoices.find(v => v.identifier === preferences.selectedEnglishVoice);
        if (englishVoice) setSelectedEnglishVoice(englishVoice);
      }
      if (preferences.selectedTurkishVoice) {
        turkishVoice = availableVoices.find(v => v.identifier === preferences.selectedTurkishVoice);
        if (turkishVoice) setSelectedTurkishVoice(turkishVoice);
      }
      
      // TTS servisine seçilen sesleri ayarla
      ttsService.setSelectedVoices(englishVoice, turkishVoice);
      
      console.log('🎤 TTS preferences loaded:', preferences);
    } catch (error) {
      console.error('❌ Error loading TTS preferences:', error);
    }
  };

  const loadAvailableVoices = async () => {
    try {
      const voices = await ttsService.getAvailableVoices();
      setAvailableVoices(voices);
      console.log('🎤 Available system voices:', voices.length);
    } catch (error) {
      console.error('❌ Error loading available voices:', error);
    }
  };

  const handleTtsToggle = async (value) => {
    setTtsEnabled(value);
    ttsService.setEnabled(value);
    await TTSPreferencesService.updatePreference('enabled', value);
  };

  const handleSpeedChange = async (speed) => {
    setCurrentSpeed(speed);
    ttsService.setSpeed(speed);
    await TTSPreferencesService.updatePreference('speed', speed);
  };

  const handleAutoReadMeaningToggle = async (value) => {
    setAutoReadMeaning(value);
    await TTSPreferencesService.updatePreference('autoReadMeaning', value);
  };

  const handleAutoReadExampleToggle = async (value) => {
    setAutoReadExample(value);
    await TTSPreferencesService.updatePreference('autoReadExample', value);
  };

  const resetToDefaults = async () => {
    Alert.alert(
      'Ayarları Sıfırla',
      'Tüm TTS ayarları varsayılan değerlere sıfırlanacak. Devam etmek istiyor musunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sıfırla',
          style: 'destructive',
          onPress: async () => {
            await TTSPreferencesService.resetPreferences();
            await loadPreferences();
            Alert.alert('Başarılı', 'TTS ayarları varsayılan değerlere sıfırlandı.');
          }
        }
      ]
    );
  };

  const speedPresets = [
    { label: 'Çok Yavaş', value: 0.5, icon: 'tortoise' },
    { label: 'Yavaş', value: 0.7, icon: 'walk' },
    { label: 'Normal', value: 0.8, icon: 'person' },
    { label: 'Hızlı', value: 1.0, icon: 'bicycle' },
    { label: 'Çok Hızlı', value: 1.3, icon: 'car' },
  ];

  const testVoices = async () => {
    try {
      console.log('🎤 Testing simulated voices...');
      
      // İngilizce test
      await ttsService.speakEnglishWord('Hello, this is a test');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Türkçe test
      await ttsService.speakTurkishMeaning('Merhaba, bu bir test');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Örnek cümle test
      await ttsService.speakExampleSentence('This is an example sentence for testing.');
      
      Alert.alert('Test Tamamlandı', 'Ses testi başarıyla tamamlandı!');
    } catch (error) {
      console.error('❌ Test error:', error);
      Alert.alert('Test Hatası', 'Ses testi sırasında bir hata oluştu.');
    }
  };









  // En iyi sesleri bul
  const getBestVoices = () => {
    const englishVoices = availableVoices.filter(v => v.language.startsWith('en'));
    const turkishVoices = availableVoices.filter(v => v.language.startsWith('tr'));
    
    // İngilizce sesleri erkek/kadın olarak ayır (pitch'e göre) - sadece 2'şer tane
    const englishMale = englishVoices.filter(v => v.pitch < 1.0).slice(0, 2);
    const englishFemale = englishVoices.filter(v => v.pitch >= 1.0).slice(0, 2);
    
    // Türkçe sesleri erkek/kadın olarak ayır - sadece 2'şer tane
    const turkishMale = turkishVoices.filter(v => v.pitch < 1.0).slice(0, 2);
    const turkishFemale = turkishVoices.filter(v => v.pitch >= 1.0).slice(0, 2);
    
    return {
      english: {
        male: englishMale,
        female: englishFemale
      },
      turkish: {
        male: turkishMale,
        female: turkishFemale
      }
    };
  };

  const selectVoice = async (voice, language) => {
    try {
      if (language === 'english') {
        setSelectedEnglishVoice(voice);
        await TTSPreferencesService.updatePreference('selectedEnglishVoice', voice.identifier);
        console.log('🎤 English voice selected:', voice.name);
      } else {
        setSelectedTurkishVoice(voice);
        await TTSPreferencesService.updatePreference('selectedTurkishVoice', voice.identifier);
        console.log('🎤 Turkish voice selected:', voice.name);
      }
      
      // TTS servisine seçilen sesleri güncelle
      const currentEnglishVoice = language === 'english' ? voice : selectedEnglishVoice;
      const currentTurkishVoice = language === 'turkish' ? voice : selectedTurkishVoice;
      ttsService.setSelectedVoices(currentEnglishVoice, currentTurkishVoice);
      
             // Test sesi çal
       const testText = language === 'english' ? 'Hello, this is your selected voice' : 'Merhaba, bu seçtiğiniz ses';
       
       // Fallback sesler için özel işlem
       if (voice.identifier.includes('fallback')) {
         if (language === 'english') {
           await ttsService.speakEnglishWord(testText);
         } else {
           await ttsService.speakTurkishMeaning(testText);
         }
       } else {
         await ttsService.speakWithSystemVoice(testText, voice.identifier);
       }
      
    } catch (error) {
      console.error('❌ Error selecting voice:', error);
      Alert.alert('Hata', 'Ses seçilirken bir hata oluştu.');
    }
  };

  const showVoiceSelection = () => {
    setVoiceSelectionModalVisible(true);
  };

  // Ses seçim kartı bileşeni
  const VoiceSelectionCard = ({ voice, isSelected, onSelect, language, index }) => {
    const isMale = voice.pitch < 1.0;
    const genderIcon = isMale ? 'male' : 'female';
    const genderColor = isMale ? '#4FC3F7' : '#FF69B4';
    const genderText = isMale ? 'Erkek' : 'Kadın';
    
    return (
      <TouchableOpacity
        style={[
          styles.voiceCard,
          isSelected && styles.voiceCardSelected,
          { backgroundColor: themeColors.cardBackground }
        ]}
        onPress={onSelect}
        activeOpacity={0.7}
      >
        <View style={styles.voiceCardHeader}>
          <View style={[styles.voiceCardAvatar, { backgroundColor: genderColor + '20' }]}>
            <Icon name={genderIcon} size={20} color={genderColor} />
          </View>
          <View style={styles.voiceCardInfo}>
            <Text style={[styles.voiceCardName, { color: themeColors.text }]}>
              {voice.name || `${genderText} ${index + 1}`}
            </Text>
            <Text style={[styles.voiceCardLanguage, { color: themeColors.textSecondary }]}>
              {language === 'english' ? '🇺🇸 İngilizce' : '🇹🇷 Türkçe'} • {genderText}
            </Text>
          </View>
          <View style={styles.voiceCardActions}>
            {isSelected ? (
              <View style={[styles.selectedIndicator, { backgroundColor: themeColors.primary }]}>
                <Icon name="checkmark" size={16} color="white" />
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.playButton, { backgroundColor: themeColors.primary }]}
                onPress={(e) => {
                  e.stopPropagation();
                  selectVoice(voice, language);
                }}
              >
                <Icon name="play" size={16} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {isSelected && (
          <View style={[styles.voiceCardFooter, { backgroundColor: themeColors.primary + '10' }]}>
            <Icon name="checkmark-circle" size={16} color={themeColors.primary} />
            <Text style={[styles.voiceCardSelectedText, { color: themeColors.primary }]}>
              Seçili Ses
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.cardBackground }]}>
      <TouchableOpacity
        style={[styles.settingsCard, { backgroundColor: themeColors.cardBackground }]}
                    onPress={() => setVoiceSelectionModalVisible(true)}
      >
        <View style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <Icon name="volume-high" size={24} color={themeColors.primary} />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: themeColors.text }]}>
              Seslendirme Ayarları
            </Text>
            <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
              {ttsEnabled ? 'Aktif' : 'Pasif'} • Hız: {speedPresets.find(s => s.value === currentSpeed)?.label || 'Normal'}
            </Text>
          </View>
          <Icon name="chevron-forward" size={20} color={themeColors.textSecondary} />
        </View>
      </TouchableOpacity>

      <Modal
        visible={voiceSelectionModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setVoiceSelectionModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: themeColors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: themeColors.cardBackground }]}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setVoiceSelectionModalVisible(false)}
            >
              <Icon name="close" size={24} color={themeColors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>
              Seslendirme Ayarları
            </Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Genel Ayarlar */}
            <View style={styles.settingSection}>
              <View style={[styles.sectionHeader, { backgroundColor: themeColors.cardBackground }]}>
                <Icon name="settings" size={20} color={themeColors.primary} />
                <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
                  Genel Ayarlar
                </Text>
              </View>
              <View style={[styles.settingCard, { backgroundColor: themeColors.cardBackground }]}>
                <View style={styles.settingItem}>
                  <View style={styles.settingInfo}>
                    <Icon name="volume-high" size={20} color={themeColors.primary} />
                    <View style={styles.settingTexts}>
                      <Text style={[styles.settingLabel, { color: themeColors.text }]}>
                        Seslendirmeyi Etkinleştir
                      </Text>
                      <Text style={[styles.settingDescription, { color: themeColors.textSecondary }]}>
                        Kelimeleri ve anlamlarını seslendir
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={ttsEnabled}
                    onValueChange={handleTtsToggle}
                    trackColor={{ false: themeColors.border, true: themeColors.primary }}
                    thumbColor={ttsEnabled ? '#fff' : '#f4f3f4'}
                  />
                </View>
              </View>
            </View>

            {/* Hız Ayarları */}
            {ttsEnabled && (
              <View style={styles.settingSection}>
                <View style={[styles.sectionHeader, { backgroundColor: themeColors.cardBackground }]}>
                  <Icon name="speedometer" size={20} color={themeColors.primary} />
                  <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
                    Konuşma Hızı
                  </Text>
                </View>
                <View style={[styles.settingCard, { backgroundColor: themeColors.cardBackground }]}>
                  {speedPresets.map((preset) => (
                    <TouchableOpacity
                      key={preset.value}
                      style={[
                        styles.speedOption,
                        currentSpeed === preset.value && { backgroundColor: themeColors.primary + '20' }
                      ]}
                      onPress={() => handleSpeedChange(preset.value)}
                    >
                      <View style={styles.speedOptionContent}>
                        <Icon 
                          name={preset.icon} 
                          size={20} 
                          color={currentSpeed === preset.value ? themeColors.primary : themeColors.textSecondary} 
                        />
                        <Text style={[
                          styles.speedOptionText,
                          { color: currentSpeed === preset.value ? themeColors.primary : themeColors.text }
                        ]}>
                          {preset.label}
                        </Text>
                      </View>
                      {currentSpeed === preset.value && (
                        <Icon name="checkmark-circle" size={20} color={themeColors.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Otomatik Okuma */}
            {ttsEnabled && (
              <View style={styles.settingSection}>
                <View style={[styles.sectionHeader, { backgroundColor: themeColors.cardBackground }]}>
                  <Icon name="play-circle" size={20} color={themeColors.primary} />
                  <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
                    Otomatik Okuma
                  </Text>
                </View>
                <View style={[styles.settingCard, { backgroundColor: themeColors.cardBackground }]}>
                  <View style={styles.settingItem}>
                    <View style={styles.settingInfo}>
                      <Icon name="text" size={20} color={themeColors.primary} />
                      <View style={styles.settingTexts}>
                        <Text style={[styles.settingLabel, { color: themeColors.text }]}>
                          Anlamı Otomatik Oku
                        </Text>
                        <Text style={[styles.settingDescription, { color: themeColors.textSecondary }]}>
                          Kart çevrildiğinde anlamı otomatik seslendir
                        </Text>
                      </View>
                    </View>
                    <Switch
                      value={autoReadMeaning}
                      onValueChange={handleAutoReadMeaningToggle}
                      trackColor={{ false: themeColors.border, true: themeColors.primary }}
                      thumbColor={autoReadMeaning ? '#fff' : '#f4f3f4'}
                    />
                  </View>
                  
                  <View style={styles.settingItem}>
                    <View style={styles.settingInfo}>
                      <Icon name="chatbubble-text" size={20} color={themeColors.primary} />
                      <View style={styles.settingTexts}>
                        <Text style={[styles.settingLabel, { color: themeColors.text }]}>
                          Örnek Cümleyi Oku
                        </Text>
                        <Text style={[styles.settingDescription, { color: themeColors.textSecondary }]}>
                          Varsa örnek cümleyi de seslendir
                        </Text>
                      </View>
                    </View>
                    <Switch
                      value={autoReadExample}
                      onValueChange={handleAutoReadExampleToggle}
                      trackColor={{ false: themeColors.border, true: themeColors.primary }}
                      thumbColor={autoReadExample ? '#fff' : '#f4f3f4'}
                    />
                  </View>
                </View>
              </View>
            )}

                         {/* Ses Seçimi */}
             {ttsEnabled && availableVoices.length > 0 && (
               <View style={styles.settingSection}>
                 <View style={[styles.sectionHeader, { backgroundColor: themeColors.cardBackground }]}>
                   <Icon name="person" size={20} color={themeColors.primary} />
                   <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
                     🎤 Ses Seçimi
                   </Text>
                 </View>
                 <View style={[styles.settingCard, { backgroundColor: themeColors.cardBackground }]}>
                   <TouchableOpacity
                     style={styles.settingItem}
                     onPress={showVoiceSelection}
                   >
                     <View style={styles.settingInfo}>
                       <Icon name="mic" size={20} color={themeColors.primary} />
                       <View style={styles.settingTexts}>
                         <Text style={[styles.settingLabel, { color: themeColors.text }]}>
                           İngilizce ve Türkçe Ses Seç
                         </Text>
                         <Text style={[styles.settingDescription, { color: themeColors.textSecondary }]}>
                           Her dil için 3 kadın 3 erkek ses arasından seçim yap
                         </Text>
                       </View>
                     </View>
                     <View style={styles.voiceSelectionInfo}>
                       <Text style={[styles.voiceSelectionText, { color: themeColors.primary }]}>
                         {selectedEnglishVoice ? 'EN: ' + selectedEnglishVoice.name : 'EN: Seçilmedi'} • {selectedTurkishVoice ? 'TR: ' + selectedTurkishVoice.name : 'TR: Seçilmedi'}
                       </Text>
                       <Icon name="chevron-forward" size={16} color={themeColors.textSecondary} />
                     </View>
                   </TouchableOpacity>
                 </View>
               </View>
             )}



            {/* Test Butonları */}
            {ttsEnabled && (
              <View style={styles.settingSection}>
                <View style={[styles.sectionHeader, { backgroundColor: themeColors.cardBackground }]}>
                  <Icon name="musical-notes" size={20} color={themeColors.primary} />
                  <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
                    Test & Debug
                  </Text>
                </View>
                <View style={[styles.testContainer, { backgroundColor: themeColors.cardBackground }]}>
                  <TouchableOpacity
                    style={[styles.testButton, { backgroundColor: themeColors.primary }]}
                    onPress={testVoices}
                  >
                    <Icon name="play" size={20} color="white" />
                    <Text style={styles.testButtonText}>Simülasyon Testi</Text>
                  </TouchableOpacity>
                  

                  
                  <TouchableOpacity
                    style={[styles.debugButton, { backgroundColor: themeColors.border }]}
                    onPress={() => {
                      console.log('🎤 Available voices:', availableVoices);
                      console.log('🔧 TTS Options - English:', ttsService.defaultOptions);
                      console.log('🔧 TTS Options - Turkish:', ttsService.turkishOptions);
                      
                      const englishSystemVoices = availableVoices.filter(v => v.language.startsWith('en'));
                      const turkishSystemVoices = availableVoices.filter(v => v.language.startsWith('tr'));
                      
                      console.log('🇺🇸 English system voices:', englishSystemVoices);
                      console.log('🇹🇷 Turkish system voices:', turkishSystemVoices);
                      
                      Alert.alert('Debug', 
                        `Toplam ${availableVoices.length} sistem sesi bulundu.\n\n` +
                        `İngilizce sistem sesleri: ${englishSystemVoices.length}\n` +
                        `Türkçe sistem sesleri: ${turkishSystemVoices.length}\n\n` +
                        `Mevcut hız: ${currentSpeed}\n` +
                        `Otomatik anlam okuma: ${autoReadMeaning ? 'Açık' : 'Kapalı'}\n` +
                        `Otomatik örnek okuma: ${autoReadExample ? 'Açık' : 'Kapalı'}\n\n` +
                        `Console'u kontrol edin.`
                      );
                    }}
                  >
                    <Icon name="information-circle" size={20} color={themeColors.text} />
                    <Text style={[styles.debugButtonText, { color: themeColors.text }]}>
                      Detaylı Bilgi
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Sıfırlama */}
            <View style={styles.settingSection}>
              <View style={[styles.sectionHeader, { backgroundColor: themeColors.cardBackground }]}>
                <Icon name="refresh" size={20} color={themeColors.primary} />
                <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
                  Sıfırlama
                </Text>
              </View>
              <View style={[styles.settingCard, { backgroundColor: themeColors.cardBackground }]}>
                <TouchableOpacity
                  style={[styles.resetButton, { backgroundColor: themeColors.border }]}
                  onPress={resetToDefaults}
                >
                  <Icon name="refresh" size={20} color={themeColors.text} />
                  <Text style={[styles.resetButtonText, { color: themeColors.text }]}>
                    Varsayılan Ayarlara Sıfırla
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
                 </View>
       </Modal>



       {/* Ses Seçim Modal */}
       <Modal
         visible={voiceSelectionModalVisible}
         animationType="slide"
         presentationStyle="pageSheet"
         onRequestClose={() => setVoiceSelectionModalVisible(false)}
       >
         <View style={[styles.modalContainer, { backgroundColor: themeColors.background }]}>
           <View style={[styles.modalHeader, { backgroundColor: themeColors.cardBackground }]}>
             <TouchableOpacity
               style={styles.closeButton}
               onPress={() => setVoiceSelectionModalVisible(false)}
             >
               <Icon name="close" size={24} color={themeColors.text} />
             </TouchableOpacity>
             <Text style={[styles.modalTitle, { color: themeColors.text }]}>
               🎤 Ses Seçimi
             </Text>
             <View style={styles.placeholder} />
           </View>

                       <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {(() => {
                const bestVoices = getBestVoices();
                
                return (
                  <>
                    {/* Seçim Durumu Özeti */}
                    <View style={[styles.selectionSummary, { backgroundColor: themeColors.cardBackground }]}>
                      <View style={styles.summaryHeader}>
                        <Icon name="information-circle" size={20} color={themeColors.primary} />
                        <Text style={[styles.summaryTitle, { color: themeColors.text }]}>
                          Seçim Durumu
                        </Text>
                      </View>
                      <View style={styles.summaryContent}>
                        <View style={styles.summaryItem}>
                          <Text style={[styles.summaryLabel, { color: themeColors.textSecondary }]}>İngilizce:</Text>
                          <Text style={[styles.summaryValue, { color: themeColors.text }]}>
                            {selectedEnglishVoice ? selectedEnglishVoice.name : 'Seçilmedi'}
                          </Text>
                        </View>
                        <View style={styles.summaryItem}>
                          <Text style={[styles.summaryLabel, { color: themeColors.textSecondary }]}>Türkçe:</Text>
                          <Text style={[styles.summaryValue, { color: themeColors.text }]}>
                            {selectedTurkishVoice ? selectedTurkishVoice.name : 'Seçilmedi'}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* İngilizce Sesler */}
                    <View style={styles.settingSection}>
                      <View style={[styles.sectionHeader, { backgroundColor: themeColors.cardBackground }]}>
                        <Icon name="flag" size={20} color={themeColors.primary} />
                        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
                          🇺🇸 İngilizce Sesler
                        </Text>
                        <View style={styles.sectionBadge}>
                          <Text style={[styles.sectionBadgeText, { color: themeColors.primary }]}>
                            {bestVoices.english.female.length + bestVoices.english.male.length} ses
                          </Text>
                        </View>
                      </View>
                      
                      {/* İngilizce Kadın Sesler */}
                      <View style={[styles.settingCard, { backgroundColor: themeColors.cardBackground }]}>
                        <View style={styles.genderHeader}>
                          <Icon name="female" size={16} color="#FF69B4" />
                          <Text style={[styles.genderTitle, { color: themeColors.text }]}>Kadın Sesler</Text>
                          <View style={[styles.genderBadge, { backgroundColor: '#FF69B4' + '20' }]}>
                            <Text style={[styles.genderBadgeText, { color: '#FF69B4' }]}>
                              {bestVoices.english.female.length}
                            </Text>
                          </View>
                        </View>
                        {bestVoices.english.female.map((voice, index) => (
                          <VoiceSelectionCard
                            key={voice.identifier}
                            voice={voice}
                            isSelected={selectedEnglishVoice?.identifier === voice.identifier}
                            onSelect={() => selectVoice(voice, 'english')}
                            language="english"
                            index={index}
                          />
                        ))}
                      </View>
                      
                      {/* İngilizce Erkek Sesler */}
                      <View style={[styles.settingCard, { backgroundColor: themeColors.cardBackground }]}>
                        <View style={styles.genderHeader}>
                          <Icon name="male" size={16} color="#4FC3F7" />
                          <Text style={[styles.genderTitle, { color: themeColors.text }]}>Erkek Sesler</Text>
                          <View style={[styles.genderBadge, { backgroundColor: '#4FC3F7' + '20' }]}>
                            <Text style={[styles.genderBadgeText, { color: '#4FC3F7' }]}>
                              {bestVoices.english.male.length}
                            </Text>
                          </View>
                        </View>
                        {bestVoices.english.male.map((voice, index) => (
                          <VoiceSelectionCard
                            key={voice.identifier}
                            voice={voice}
                            isSelected={selectedEnglishVoice?.identifier === voice.identifier}
                            onSelect={() => selectVoice(voice, 'english')}
                            language="english"
                            index={index}
                          />
                        ))}
                      </View>
                    </View>

                    {/* Türkçe Sesler */}
                    <View style={styles.settingSection}>
                      <View style={[styles.sectionHeader, { backgroundColor: themeColors.cardBackground }]}>
                        <Icon name="flag" size={20} color={themeColors.primary} />
                        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
                          🇹🇷 Türkçe Sesler
                        </Text>
                        <View style={styles.sectionBadge}>
                          <Text style={[styles.sectionBadgeText, { color: themeColors.primary }]}>
                            {bestVoices.turkish.female.length + bestVoices.turkish.male.length} ses
                          </Text>
                        </View>
                      </View>
                      
                      {/* Türkçe Kadın Sesler */}
                      <View style={[styles.settingCard, { backgroundColor: themeColors.cardBackground }]}>
                        <View style={styles.genderHeader}>
                          <Icon name="female" size={16} color="#FF69B4" />
                          <Text style={[styles.genderTitle, { color: themeColors.text }]}>Kadın Sesler</Text>
                          <View style={[styles.genderBadge, { backgroundColor: '#FF69B4' + '20' }]}>
                            <Text style={[styles.genderBadgeText, { color: '#FF69B4' }]}>
                              {bestVoices.turkish.female.length}
                            </Text>
                          </View>
                        </View>
                        {bestVoices.turkish.female.map((voice, index) => (
                          <VoiceSelectionCard
                            key={voice.identifier}
                            voice={voice}
                            isSelected={selectedTurkishVoice?.identifier === voice.identifier}
                            onSelect={() => selectVoice(voice, 'turkish')}
                            language="turkish"
                            index={index}
                          />
                        ))}
                      </View>
                      
                      {/* Türkçe Erkek Sesler */}
                      <View style={[styles.settingCard, { backgroundColor: themeColors.cardBackground }]}>
                        <View style={styles.genderHeader}>
                          <Icon name="male" size={16} color="#4FC3F7" />
                          <Text style={[styles.genderTitle, { color: themeColors.text }]}>Erkek Sesler</Text>
                          <View style={[styles.genderBadge, { backgroundColor: '#4FC3F7' + '20' }]}>
                            <Text style={[styles.genderBadgeText, { color: '#4FC3F7' }]}>
                              {bestVoices.turkish.male.length}
                            </Text>
                          </View>
                        </View>
                        {bestVoices.turkish.male.map((voice, index) => (
                          <VoiceSelectionCard
                            key={voice.identifier}
                            voice={voice}
                            isSelected={selectedTurkishVoice?.identifier === voice.identifier}
                            onSelect={() => selectVoice(voice, 'turkish')}
                            language="turkish"
                            index={index}
                          />
                        ))}
                      </View>
                    </View>

                    {/* Kullanım Talimatları */}
                    <View style={[styles.instructionsCard, { backgroundColor: themeColors.cardBackground }]}>
                      <View style={styles.instructionsHeader}>
                        <Icon name="help-circle" size={20} color={themeColors.primary} />
                        <Text style={[styles.instructionsTitle, { color: themeColors.text }]}>
                          Nasıl Kullanılır?
                        </Text>
                      </View>
                      <View style={styles.instructionsContent}>
                        <Text style={[styles.instructionsText, { color: themeColors.textSecondary }]}>
                          • Ses kartına dokunarak seçim yapın{'\n'}
                          • ▶️ butonuna basarak sesi test edin{'\n'}
                          • Seçili sesler mavi çerçeve ile gösterilir{'\n'}
                          • Her dil için ayrı ses seçebilirsiniz
                        </Text>
                      </View>
                    </View>
                  </>
                );
              })()}
            </ScrollView>
         </View>
       </Modal>
     </View>
   );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  settingsCard: {
    padding: 16,
    borderRadius: 12,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 32,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  settingSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  settingCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTexts: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    opacity: 0.7,
  },

  speedOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  speedOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  speedOptionText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  testContainer: {
    borderRadius: 12,
    padding: 16,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  debugButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  debugButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  voiceSelectionInfo: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  voiceSelectionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  genderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  genderTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  voiceSelectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 8,
    marginHorizontal: 8,
    marginVertical: 2,
  },
  voiceSelectionInfo: {
    flex: 1,
  },
  voiceSelectionName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  voiceSelectionId: {
    fontSize: 12,
    opacity: 0.7,
  },
  voiceSelectionActions: {
    paddingHorizontal: 8,
  },
  voiceCard: {
    borderRadius: 12,
    marginVertical: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  voiceCardSelected: {
    borderColor: 'rgba(0, 122, 255, 0.5)',
  },
  voiceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  voiceCardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  voiceCardInfo: {
    flex: 1,
  },
  voiceCardName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  voiceCardLanguage: {
    fontSize: 12,
    opacity: 0.7,
  },
  voiceCardActions: {
    paddingHorizontal: 8,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  voiceCardSelectedText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  selectionSummary: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  summaryContent: {
    padding: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionBadge: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 'auto',
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  genderBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 'auto',
  },
  genderBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  instructionsCard: {
    borderRadius: 12,
    marginTop: 16,
    overflow: 'hidden',
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  instructionsContent: {
    padding: 16,
  },
  instructionsText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default TTSSettingsSection;
