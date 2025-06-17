import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface Voiceover {
  id: string;
  story_id: string;
  voice_url: string;
  narrator: string;
  language: string;
  created_at: string;
}

interface Props {
  storyId: string;
  isAdmin?: boolean;
}

const Voiceovers: React.FC<Props> = ({ storyId, isAdmin = false }) => {
  const [voiceovers, setVoiceovers] = useState<Voiceover[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1.0);

  // Upload States
  const [uploading, setUploading] = useState(false);
  const [narrator, setNarrator] = useState('');
  const [language, setLanguage] = useState('English');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchVoiceovers();
  }, [storyId]);

  const fetchVoiceovers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('voiceovers')
      .select('*')
      .eq('story_id', storyId)
      .order('created_at', { ascending: false });

    if (!error) setVoiceovers(data || []);
    setLoading(false);
  };

  const handlePlay = (url: string) => {
    setSelected(url);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.playbackRate = playbackRate;
    audio.play();
  };

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.[0] || !narrator) return;
    setUploading(true);

    const file = fileInputRef.current.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `voiceovers/${Date.now()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('stories')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload failed:', uploadError.message);
      setUploading(false);
      return;
    }

    const { publicURL } = supabase.storage.from('stories').getPublicUrl(filePath);

    await supabase.from('voiceovers').insert([
      {
        story_id: storyId,
        narrator,
        language,
        voice_url: publicURL,
      },
    ]);

    setNarrator('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    await fetchVoiceovers();
    setUploading(false);
  };

  const triggerMWALIMU = async () => {
    setUploading(true);
    const { error } = await fetch(`/api/mwalimu/generate-voice?story_id=${storyId}`);
    if (error) console.error('MWALIMU-AI trigger failed');
    await fetchVoiceovers();
    setUploading(false);
  };

  return (
    <div className="mt-5">
      <h2 className="text-lg font-bold">🎧 Voice Narrations</h2>

      <div className="my-2 flex items-center space-x-3">
        <label className="text-sm">Playback speed:</label>
        <select
          value={playbackRate}
          onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
          className="border px-2 py-1 rounded text-sm"
        >
          <option value="0.75">0.75x</option>
          <option value="1.0">1x (Normal)</option>
          <option value="1.25">1.25x</option>
          <option value="1.5">1.5x</option>
        </select>
      </div>

      {loading ? (
        <p>Loading voiceovers...</p>
      ) : voiceovers.length === 0 ? (
        <p className="text-muted text-sm">No voiceovers yet.</p>
      ) : (
        <div className="grid gap-3 mt-3">
          {voiceovers.map((v) => (
            <Card
              key={v.id}
              className={`p-3 flex justify-between items-center ${selected === v.voice_url ? 'border-primary border' : ''}`}
            >
              <div>
                <p className="font-medium text-sm">Narrator: {v.narrator}</p>
                <p className="text-xs text-gray-500">Language: {v.language}</p>
              </div>
              <Button onClick={() => handlePlay(v.voice_url)}>▶️ Play</Button>
            </Card>
          ))}
        </div>
      )}

      {isAdmin && (
        <div className="mt-6">
          <h4 className="font-semibold mb-2">📤 Upload New Voiceover</h4>
          <div className="grid gap-2">
            <Input placeholder="Narrator name" value={narrator} onChange={(e) => setNarrator(e.target.value)} />
            <select
              className="border p-2 rounded text-sm"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option>English</option>
              <option>Kiswahili</option>
              <option>French</option>
              <option>Chinese</option>
            </select>
            <input ref={fileInputRef} type="file" accept="audio/*" className="text-sm" />
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Upload'}
            </Button>
            <Button variant="secondary" onClick={triggerMWALIMU} disabled={uploading}>
              {uploading ? <Loader2 className="animate-spin w-4 h-4" /> : '🎤 Generate with MWALIMU-AI'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Voiceovers; 
