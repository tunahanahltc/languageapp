export interface TTSConfig {
  debug: {
    enabled: boolean;
  };
  timing: {
    meaningToExampleDelay: number;
  };
}

export interface LanguageConfig {
  language: string;
  pitch: number;
  rate: number;
  volume: number;
}

export interface SpecialCaseConfig {
  rate?: number;
  pitch?: number;
  volume?: number;
}

export const TTS_CONFIG: TTSConfig = {
  debug: {
    enabled: false,
  },
  timing: {
    meaningToExampleDelay: 500,
  },
};

export function getEnglishConfig(): LanguageConfig {
  return {
    language: 'en-US',
    pitch: 1.0,
    rate: 0.8,
    volume: 1.0,
  };
}

export function getTurkishConfig(): LanguageConfig {
  return {
    language: 'tr-TR',
    pitch: 1.0,
    rate: 0.8,
    volume: 1.0,
  };
}

export function getSpecialCase(key: string): SpecialCaseConfig {
  switch (key) {
    case 'exampleSentence':
      return {
        rate: 0.75,
      };
    default:
      return {};
  }
}
