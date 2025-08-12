export const TTS_CONFIG = {
  debug: {
    enabled: false,
  },
  timing: {
    meaningToExampleDelay: 500,
  },
};

export function getEnglishConfig() {
  return {
    language: 'en-US',
    pitch: 1.0,
    rate: 0.8,
    volume: 1.0,
  };
}

export function getTurkishConfig() {
  return {
    language: 'tr-TR',
    pitch: 1.0,
    rate: 0.8,
    volume: 1.0,
  };
}

export function getSpecialCase(key) {
  switch (key) {
    case 'exampleSentence':
      return {
        rate: 0.75,
      };
    default:
      return {};
  }
}
