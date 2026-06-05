import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { emojiPrompts } from '../data/emojiPrompts';
import { ScoreService } from '../services/ScoreService';
import { GameResult } from '../store/useStore';

interface EmojiStoryProps {
  onComplete: (result: GameResult) => void;
}

export const EmojiStory: React.FC<EmojiStoryProps> = ({ onComplete }) => {
  const { players, conclave } = useStore();
  const alivePlayers = players.filter((p) => conclave.aliveIds.includes(p.id));

  const prompts = [...emojiPrompts].sort(() => Math.random() - 0.5).slice(0, 3);
  const [promptIdx, setPromptIdx] = useState(0);
  const [encoderIdx, setEncoderIdx] = useState(0);
  const [phase, setPhase] = useState<'encode' | 'decode'>('encode');
  const [emojiString, setEmojiString] = useState('');
  const [decoderIdx, setDecoderIdx] = useState(0);
  const [decodeGuess, setDecodeGuess] = useState('');
  const [scores, setScores] = useState<Record<string, number>>({});
  const [gameOver, setGameOver] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const currentPrompt = prompts[promptIdx];
  const encoder = alivePlayers[encoderIdx % alivePlayers.length];
  const decoders = alivePlayers.filter(p => p.id !== encoder.id);
  const currentDecoder = decoders[decoderIdx % decoders.length];

  const handleSubmitEmoji = () => {
    if (!emojiString.trim()) return;
    setPhase('decode');
    setDecoderIdx(0);
    setDecodeGuess('');
  };

  const handleDecodeSubmit = () => {
    const guess = decodeGuess.trim().toLowerCase();
    const answer = currentPrompt.phrase.toLowerCase();
    const correct = guess === answer || answer.includes(guess);
    if (correct) {
      setScores(s => ({
        ...s,
        [currentDecoder.id]: (s[currentDecoder.id] || 0) + 2,
        [encoder.id]: (s[encoder.id] || 0) + 1,
      }));
    }
    setDecodeGuess('');
    if (decoderIdx + 1 >= decoders.length) {
      setRevealed(true);
    } else {
      setDecoderIdx(decoderIdx + 1);
    }
  };

  const handleNextRound = () => {
    if (promptIdx + 1 >= prompts.length) {
      setGameOver(true);
    } else {
      setPromptIdx(promptIdx + 1);
      setEncoderIdx(encoderIdx + 1);
      setPhase('encode');
      setEmojiString('');
      setDecoderIdx(0);
      setRevealed(false);
    }
  };

  if (gameOver) {
    const coinDeltas = ScoreService.computeCoinDeltas(scores, alivePlayers);
    const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    const topPlayer = players.find((p) => p.id === top?.[0]);
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--flame)' }}>Emoji Story Over!</h2>
        <div className="w-full max-w-sm space-y-2">
          {[...alivePlayers].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0)).map((p) => (
            <div key={p.id} className="flex justify-between p-3 rounded-lg"
              style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.15)' }}>
              <span style={{ color: 'var(--ink)' }}>{p.name}</span>
              <span style={{ color: 'var(--flame)' }}>
                {scores[p.id] || 0} pts {coinDeltas[p.id] ? `· +${coinDeltas[p.id]}` : ''}
              </span>
            </div>
          ))}
        </div>
        <button className="px-8 py-3 rounded-xl font-bold" style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
          onClick={() => onComplete({
            moduleId: 'emoji_story',
            summary: topPlayer ? `${topPlayer.name} told the best emoji story!` : 'Lost in translation!',
            coinDeltas, shieldsAwarded: {}, suspicionDeltas: {}, tells: [], timestamp: Date.now(),
          })}>
          Continue ▶
        </button>
      </div>
    );
  }

  if (phase === 'encode') {
    return (
      <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--flame)' }}>Emoji Story</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Round {promptIdx + 1}/{prompts.length}</p>
        </div>

        <div className="rounded-xl p-4"
          style={{ backgroundColor: 'rgba(142,36,51,0.1)', border: '1px solid rgba(142,36,51,0.3)' }}>
          <p className="text-xs font-bold mb-1" style={{ color: 'var(--crimson)' }}>
            ENCODER: {encoder?.name} (secret!)
          </p>
          <p className="text-lg font-bold" style={{ color: 'var(--ink)' }}>{currentPrompt.phrase}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Hint: {currentPrompt.hint}</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold" style={{ color: 'var(--ink)' }}>
            Build your emoji sequence:
          </label>
          <input
            type="text"
            value={emojiString}
            onChange={(e) => setEmojiString(e.target.value)}
            placeholder="Type or paste emojis here... 🔥💀⚔️"
            className="w-full text-2xl p-3"
            style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.3)', color: 'var(--ink)', borderRadius: '8px' }}
          />
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            Suggested: {currentPrompt.emojiSuggestion}
          </p>
        </div>

        <button className="w-full py-3 rounded-xl font-bold disabled:opacity-40"
          style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
          onClick={handleSubmitEmoji} disabled={!emojiString.trim()}>
          Lock in sequence — others decode!
        </button>
      </div>
    );
  }

  if (revealed) {
    return (
      <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--flame)' }}>Reveal!</h2>
          <div className="text-4xl mt-3">{emojiString}</div>
          <p className="mt-3 text-xl font-bold" style={{ color: 'var(--ink)' }}>{currentPrompt.phrase}</p>
        </div>
        <button className="w-full py-3 rounded-xl font-bold"
          style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
          onClick={handleNextRound}>
          {promptIdx + 1 < prompts.length ? 'Next Round →' : 'See Scores'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--flame)' }}>Decode It!</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          {currentDecoder?.name}, what story does this tell?
        </p>
      </div>

      <div className="rounded-xl p-6 text-center text-4xl"
        style={{ backgroundColor: 'var(--bg-raise)', border: '1px solid rgba(182,168,146,0.2)' }}>
        {emojiString}
      </div>

      <div className="flex gap-2">
        <input type="text" value={decodeGuess}
          onChange={(e) => setDecodeGuess(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleDecodeSubmit()}
          placeholder="Your interpretation..."
          className="flex-1"
        />
        <button className="px-4 py-2 rounded-xl font-bold"
          style={{ backgroundColor: 'var(--flame)', color: '#14110E' }}
          onClick={handleDecodeSubmit} disabled={!decodeGuess.trim()}>
          Submit
        </button>
      </div>

      <p className="text-xs text-center" style={{ color: 'var(--muted)' }}>
        Decoder {decoderIdx + 1}/{decoders.length}
      </p>
    </div>
  );
};
