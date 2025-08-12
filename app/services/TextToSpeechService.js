import * as Speech from 'expo-speech';
import { TTS_CONFIG, getEnglishConfig, getTurkishConfig, getSpecialCase } from '../config/ttsConfig';

class TextToSpeechService {
  constructor() {
    // Konfigürasyon dosyasından ayarları al
    this.defaultOptions = getEnglishConfig();
    this.turkishOptions = getTurkishConfig();
    this.isEnabled = true;
    this.currentSpeed = 'normal';
  }

  // İngilizce kelime okuma
  async speakEnglishWord(word, options = {}) {
    try {
      const speakOptions = {
        ...this.defaultOptions,
        ...options,
      };

      console.log(`🔊 Speaking English: "${word}"`);
      
      await Speech.speak(word, speakOptions);
      
      return true;
    } catch (error) {
      console.error('❌ English TTS Error:', error);
      return false;
    }
  }

  // Türkçe anlam okuma
  async speakTurkishMeaning(meaning, options = {}) {
    try {
      const speakOptions = {
        ...this.turkishOptions,
        ...options,
      };

      console.log(`🔊 Speaking Turkish: "${meaning}"`);
      
      await Speech.speak(meaning, speakOptions);
      
      return true;
    } catch (error) {
      console.error('❌ Turkish TTS Error:', error);
      return false;
    }
  }

  // Örnek cümle okuma (İngilizce)
  async speakExampleSentence(sentence, options = {}) {
    try {
      const exampleConfig = getSpecialCase('exampleSentence');
      const speakOptions = {
        ...this.defaultOptions,
        ...exampleConfig,
        ...options,
      };

      if (TTS_CONFIG.debug.enabled) {
        console.log(`🔊 Speaking Example: "${sentence}"`);
      }
      
      await Speech.speak(sentence, speakOptions);
      
      return true;
    } catch (error) {
      console.error('❌ Example TTS Error:', error);
      return false;
    }
  }

  // Genel konuşma fonksiyonu (dil otomatik algılama)
  async speakText(text, language = 'auto', options = {}) {
    try {
      let speakOptions;
      
      if (language === 'auto') {
        // Basit dil algılama
        const hasTurkishChars = /[çğıöşüÇĞIİÖŞÜ]/.test(text);
        speakOptions = hasTurkishChars ? this.turkishOptions : this.defaultOptions;
      } else if (language === 'tr') {
        speakOptions = this.turkishOptions;
      } else {
        speakOptions = this.defaultOptions;
      }

      speakOptions = {
        ...speakOptions,
        ...options,
      };

      console.log(`🔊 Speaking (${speakOptions.language}): "${text}"`);
      
      await Speech.speak(text, speakOptions);
      
      return true;
    } catch (error) {
      console.error('❌ TTS Error:', error);
      return false;
    }
  }

  // Konuşmayı durdur
  async stopSpeaking() {
    try {
      await Speech.stop();
      console.log('🔇 Speech stopped');
      return true;
    } catch (error) {
      console.error('❌ Stop Speech Error:', error);
      return false;
    }
  }

  // Ses durumunu kontrol et
  async isSpeaking() {
    try {
      return await Speech.isSpeakingAsync();
    } catch (error) {
      console.error('❌ Check Speaking Error:', error);
      return false;
    }
  }

  // Mevcut sesleri listele (iOS ve Android'de farklı)
  async getAvailableVoices() {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      console.log('🎤 Available voices:', voices);
      return voices;
    } catch (error) {
      console.error('❌ Get Voices Error:', error);
      return [];
    }
  }

  // Ses ayarlarını güncelle
  updateDefaultOptions(newOptions) {
    this.defaultOptions = {
      ...this.defaultOptions,
      ...newOptions,
    };
    console.log('🔧 Updated English TTS options:', this.defaultOptions);
  }

  // Türkçe ses ayarlarını güncelle
  updateTurkishOptions(newOptions) {
    this.turkishOptions = {
      ...this.turkishOptions,
      ...newOptions,
    };
    console.log('🔧 Updated Turkish TTS options:', this.turkishOptions);
  }

  // Hızlı ayar presetleri
  setSpeed(speed) {
    const speedMap = {
      'very-slow': 0.4,
      'slow': 0.6,
      'normal': 0.8,
      'fast': 1.0,
      'very-fast': 1.2,
    };
    
    const rate = speedMap[speed] || 0.8;
    
    this.updateDefaultOptions({ rate });
    this.updateTurkishOptions({ rate });
    
    console.log(`⚡ Speech speed set to: ${speed} (${rate})`);
  }

  // Pitch ayarı
  setPitch(pitch) {
    const pitchValue = Math.max(0.5, Math.min(2.0, pitch));
    
    this.updateDefaultOptions({ pitch: pitchValue });
    this.updateTurkishOptions({ pitch: pitchValue });
    
    console.log(`🎵 Speech pitch set to: ${pitchValue}`);
  }

  // Volume ayarı
  setVolume(volume) {
    const volumeValue = Math.max(0.0, Math.min(1.0, volume));
    
    this.updateDefaultOptions({ volume: volumeValue });
    this.updateTurkishOptions({ volume: volumeValue });
    
    console.log(`🔊 Speech volume set to: ${volumeValue}`);
  }

  // TTS'i aktif/pasif yapma
  setEnabled(enabled) {
    this.isEnabled = enabled;
    console.log(`🔊 TTS ${enabled ? 'enabled' : 'disabled'}`);
    
    if (!enabled) {
      this.stopSpeaking();
    }
  }

  // Flashcard özel fonksiyonu
  async speakCurrentSide(word, isFlipped = false, hasExample = false) {
    if (!this.isEnabled) return false;

    try {
      if (isFlipped) {
        // Arka taraf - Türkçe anlam
        await this.speakTurkishMeaning(word.meaning);
        
        // Örnek cümle varsa bekle ve oku
        if (hasExample && word.example_sentence) {
          setTimeout(async () => {
            await this.speakExampleSentence(word.example_sentence);
          }, TTS_CONFIG.timing.meaningToExampleDelay);
        }
      } else {
        // Ön taraf - İngilizce kelime
        await this.speakEnglishWord(word.word_text);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Flashcard TTS Error:', error);
      return false;
    }
  }
}

// Singleton instance
const ttsService = new TextToSpeechService();

// Export hem class hem de instance
export default ttsService;
export { TextToSpeechService };

// Kolay kullanım için shortcut fonksiyonlar
export const speakWord = (word, options) => ttsService.speakEnglishWord(word, options);
export const speakMeaning = (meaning, options) => ttsService.speakTurkishMeaning(meaning, options);
export const speakExample = (sentence, options) => ttsService.speakExampleSentence(sentence, options);
export const speakAny = (text, language, options) => ttsService.speakText(text, language, options);
export const stopSpeech = () => ttsService.stopSpeaking();
