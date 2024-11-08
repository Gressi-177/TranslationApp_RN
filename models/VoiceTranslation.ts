interface VoiceTranslation {
  id?: number;
  source_text: string;
  source_language: string;
  translated_text: string;
  target_language: string;
  is_mine: boolean;
  is_marked?: boolean;
  is_deleted?: boolean;
  created_at?: Date;
}

export default VoiceTranslation;
