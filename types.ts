export interface Haiku {
  id: number;
  text: string; // The French text
  tags: string[];
  translation?: string; // Optional English translation/interpretation
  imageId: string; // For picsum seed
}

export enum AppState {
  HOME = 'HOME',
  GALLERY = 'GALLERY',
  RESULT = 'RESULT',
}

export interface GeminiResponse {
  haikuId: number;
  explanation: string;
}