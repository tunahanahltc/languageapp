const wordSets = [
  {
    id: 1,
    baslik: "Hayvanlar",
    aciklama: "En yaygın hayvan isimleri.",
    kategori: "topics",
    zorluk: "Kolay",
    icon: "🐾",
    gradient: ["#10B981", "#3B82F6"],
    kelimeler: [
      { id: 1, kelime: "cat", anlam: "kedi", ornekCumle: "The cat is sleeping.", resim: null },
      { id: 2, kelime: "dog", anlam: "köpek", ornekCumle: "The dog is barking.", resim: null },
      { id: 3, kelime: "bird", anlam: "kuş", ornekCumle: "A bird is flying.", resim: null },
      { id: 4, kelime: "horse", anlam: "at", ornekCumle: "The horse runs fast.", resim: null },
      { id: 5, kelime: "fish", anlam: "balık", ornekCumle: "Fish live in water.", resim: null },
      { id: 6, kelime: "lion", anlam: "aslan", ornekCumle: "The lion is the king of the jungle.", resim: null },
      { id: 7, kelime: "elephant", anlam: "fil", ornekCumle: "The elephant has a long trunk.", resim: null },
      { id: 8, kelime: "rabbit", anlam: "tavşan", ornekCumle: "The rabbit eats carrots.", resim: null },
    ]
  },
  {
    id: 2,
    baslik: "Meyveler",
    aciklama: "Yaygın meyve isimleri.",
    kategori: "topics",
    zorluk: "Kolay",
    icon: "🍎",
    gradient: ["#F59E0B", "#EF4444"],
    kelimeler: [
      { id: 1, kelime: "apple", anlam: "elma", ornekCumle: "I eat an apple every day.", resim: null },
      { id: 2, kelime: "banana", anlam: "muz", ornekCumle: "Bananas are yellow.", resim: null },
      { id: 3, kelime: "grape", anlam: "üzüm", ornekCumle: "Grapes can be green or purple.", resim: null },
      { id: 4, kelime: "orange", anlam: "portakal", ornekCumle: "Oranges are rich in vitamin C.", resim: null },
      { id: 5, kelime: "strawberry", anlam: "çilek", ornekCumle: "Strawberries are sweet.", resim: null },
      { id: 6, kelime: "watermelon", anlam: "karpuz", ornekCumle: "Watermelon is refreshing in summer.", resim: null },
      { id: 7, kelime: "lemon", anlam: "limon", ornekCumle: "Lemons are sour.", resim: null },
      { id: 8, kelime: "pear", anlam: "armut", ornekCumle: "Pears are juicy.", resim: null },
    ]
  },
  {
    id: 3,
    baslik: "Renkler",
    aciklama: "Temel renk isimleri.",
    kategori: "topics",
    zorluk: "Kolay",
    icon: "🎨",
    gradient: ["#6366F1", "#8B5CF6"],
    kelimeler: [
      { id: 1, kelime: "red", anlam: "kırmızı", ornekCumle: "The apple is red.", resim: null },
      { id: 2, kelime: "blue", anlam: "mavi", ornekCumle: "The sky is blue.", resim: null },
      { id: 3, kelime: "green", anlam: "yeşil", ornekCumle: "Grass is green.", resim: null },
      { id: 4, kelime: "yellow", anlam: "sarı", ornekCumle: "Bananas are yellow.", resim: null },
      { id: 5, kelime: "black", anlam: "siyah", ornekCumle: "The cat is black.", resim: null },
      { id: 6, kelime: "white", anlam: "beyaz", ornekCumle: "Snow is white.", resim: null },
      { id: 7, kelime: "orange", anlam: "turuncu", ornekCumle: "Oranges are orange.", resim: null },
      { id: 8, kelime: "purple", anlam: "mor", ornekCumle: "Grapes are purple.", resim: null },
    ]
  },
  {
    id: 4,
    baslik: "Meslekler",
    aciklama: "Yaygın meslek isimleri.",
    kategori: "topics",
    zorluk: "Orta",
    icon: "👩‍⚕️",
    gradient: ["#06b6d4", "#818cf8"],
    kelimeler: [
      { id: 1, kelime: "doctor", anlam: "doktor", ornekCumle: "The doctor works at the hospital.", resim: null },
      { id: 2, kelime: "teacher", anlam: "öğretmen", ornekCumle: "The teacher is in the classroom.", resim: null },
      { id: 3, kelime: "engineer", anlam: "mühendis", ornekCumle: "The engineer designs bridges.", resim: null },
      { id: 4, kelime: "nurse", anlam: "hemşire", ornekCumle: "The nurse helps patients.", resim: null },
      { id: 5, kelime: "police", anlam: "polis", ornekCumle: "The police keep the city safe.", resim: null },
      { id: 6, kelime: "chef", anlam: "aşçı", ornekCumle: "The chef cooks delicious food.", resim: null },
      { id: 7, kelime: "driver", anlam: "şoför", ornekCumle: "The driver drives a bus.", resim: null },
      { id: 8, kelime: "farmer", anlam: "çiftçi", ornekCumle: "The farmer grows vegetables.", resim: null },
    ]
  },
  {
    id: 5,
    baslik: "Duygular",
    aciklama: "Temel duygu ifadeleri.",
    kategori: "topics",
    zorluk: "Orta",
    icon: "😊",
    gradient: ["#f43f5e", "#fbbf24"],
    kelimeler: [
      { id: 1, kelime: "happy", anlam: "mutlu", ornekCumle: "She is very happy today.", resim: null },
      { id: 2, kelime: "sad", anlam: "üzgün", ornekCumle: "He looks sad.", resim: null },
      { id: 3, kelime: "angry", anlam: "kızgın", ornekCumle: "The teacher is angry.", resim: null },
      { id: 4, kelime: "excited", anlam: "heyecanlı", ornekCumle: "The children are excited.", resim: null },
      { id: 5, kelime: "scared", anlam: "korkmuş", ornekCumle: "The cat is scared.", resim: null },
      { id: 6, kelime: "bored", anlam: "sıkılmış", ornekCumle: "He is bored in class.", resim: null },
      { id: 7, kelime: "surprised", anlam: "şaşırmış", ornekCumle: "She is surprised by the gift.", resim: null },
      { id: 8, kelime: "tired", anlam: "yorgun", ornekCumle: "He is tired after work.", resim: null },
    ]
  }
];

export default wordSets;

