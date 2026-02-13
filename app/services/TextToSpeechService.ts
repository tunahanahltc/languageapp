import * as Speech from 'expo-speech';
import { TTS_CONFIG, getEnglishConfig, getTurkishConfig, getSpecialCase, LanguageConfig, SpecialCaseConfig } from '../config/ttsConfig';

interface WordData {
  word_text: string;
  meaning: string;
  example_sentence?: string;
}

type SpeedType = 'very-slow' | 'slow' | 'normal' | 'fast' | 'very-fast';

class TextToSpeechService {
  private defaultOptions: LanguageConfig;
  private turkishOptions: LanguageConfig;
  private isEnabled: boolean;
  private currentSpeed: string;

  constructor() {
    // Konfigürasyon dosyasından ayarları al
    this.defaultOptions = getEnglishConfig();
    this.turkishOptions = getTurkishConfig();
    this.isEnabled = true;
    this.currentSpeed = 'normal';
  }

  // İngilizce kelime okuma
  async speakEnglishWord(word: string, options: Partial<LanguageConfig> = {}): Promise<boolean> {
    try {
      const speakOptions: Speech.SpeechOptions = {
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
  async speakTurkishMeaning(meaning: string, options: Partial<LanguageConfig> = {}): Promise<boolean> {
    try {
      const speakOptions: Speech.SpeechOptions = {
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
  async speakExampleSentence(sentence: string, options: Partial<LanguageConfig> = {}): Promise<boolean> {
    try {
      const exampleConfig = getSpecialCase('exampleSentence');
      const speakOptions: Speech.SpeechOptions = {
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
  async speakText(text: string, language: string = 'auto', options: Partial<LanguageConfig> = {}): Promise<boolean> {
    try {
      let speakOptions: Speech.SpeechOptions;
      
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
  async stopSpeaking(): Promise<boolean> {
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
  async isSpeaking(): Promise<boolean> {
    try {
      return await Speech.isSpeakingAsync();
    } catch (error) {
      console.error('❌ Check Speaking Error:', error);
      return false;
    }
  }

  // Mevcut sesleri listele (iOS ve Android'de farklı)
  async getAvailableVoices(): Promise<Speech.Voice[]> {
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
  updateDefaultOptions(newOptions: Partial<LanguageConfig>): void {
    this.defaultOptions = {
      ...this.defaultOptions,
      ...newOptions,
    };
    console.log('🔧 Updated English TTS options:', this.defaultOptions);
  }

  // Türkçe ses ayarlarını güncelle
  updateTurkishOptions(newOptions: Partial<LanguageConfig>): void {
    this.turkishOptions = {
      ...this.turkishOptions,
      ...newOptions,
    };
    console.log('🔧 Updated Turkish TTS options:', this.turkishOptions);
  }

  // Hızlı ayar presetleri
  setSpeed(speed: SpeedType): void {
    const speedMap: Record<SpeedType, number> = {
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
  setPitch(pitch: number): void {
    const pitchValue = Math.max(0.5, Math.min(2.0, pitch));
    
    this.updateDefaultOptions({ pitch: pitchValue });
    this.updateTurkishOptions({ pitch: pitchValue });
    
    console.log(`🎵 Speech pitch set to: ${pitchValue}`);
  }

  // Volume ayarı
  setVolume(volume: number): void {
    const volumeValue = Math.max(0.0, Math.min(1.0, volume));
    
    this.updateDefaultOptions({ volume: volumeValue });
    this.updateTurkishOptions({ volume: volumeValue });
    
    console.log(`🔊 Speech volume set to: ${volumeValue}`);
  }

  // TTS'i aktif/pasif yapma
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    console.log(`🔊 TTS ${enabled ? 'enabled' : 'disabled'}`);
    
    if (!enabled) {
      this.stopSpeaking();
    }
  }

  // Flashcard özel fonksiyonu
  async speakCurrentSide(word: WordData, isFlipped: boolean = false, hasExample: boolean = false): Promise<boolean> {
    if (!this.isEnabled) return false;

    try {
      if (isFlipped) {
        // Arka taraf - Türkçe anlam
        await this.speakTurkishMeaning(word.meaning);
        
        // Örnek cümle varsa bekle ve oku
        if (hasExample && word.example_sentence) {
          setTimeout(async () => {
            await this.speakExampleSentence(word.example_sentence!);
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
export const speakWord = (word: string, options?: Partial<LanguageConfig>) => ttsService.speakEnglishWord(word, options);
export const speakMeaning = (meaning: string, options?: Partial<LanguageConfig>) => ttsService.speakTurkishMeaning(meaning, options);
export const speakExample = (sentence: string, options?: Partial<LanguageConfig>) => ttsService.speakExampleSentence(sentence, options);
export const speakAny = (text: string, language?: string, options?: Partial<LanguageConfig>) => ttsService.speakText(text, language, options);
export const stopSpeech = () => ttsService.stopSpeaking();
