import { useCallback, useRef, useEffect } from 'react';

export type SoundEffect = 
  | 'bet' 
  | 'fold' 
  | 'call' 
  | 'raise' 
  | 'allIn' 
  | 'win' 
  | 'lose'
  | 'cardDeal' 
  | 'cardFlip'
  | 'shuffle' 
  | 'chipCollect'
  | 'timerTick'
  | 'timerWarning'
  | 'playerJoin'
  | 'playerLeave'
  | 'achievement'
  | 'levelUp';

export const useSoundManager = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundEnabledRef = useRef(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playTone = useCallback(async (frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.5) => {
    if (!soundEnabledRef.current || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    
    // AudioContextがサスペンド状態の場合は再開
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }, []);

  const playChord = useCallback((frequencies: number[], duration: number, type: OscillatorType = 'sine', volume: number = 0.4) => {
    frequencies.forEach(freq => playTone(freq, duration, type, volume));
  }, [playTone]);

  const playRichSound = useCallback(async (frequencies: number[], duration: number, envelope: {attack: number, decay: number, sustain: number, release: number}, filterFreq?: number) => {
    if (!soundEnabledRef.current || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') await ctx.resume();

    frequencies.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.value = freq;
      
      filter.type = 'lowpass';
      filter.frequency.value = filterFreq || freq * 2;
      filter.Q.value = 1;

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      const attackEnd = now + envelope.attack;
      const decayEnd = attackEnd + envelope.decay;
      const releaseStart = now + duration - envelope.release;

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3 / frequencies.length, attackEnd);
      gain.gain.linearRampToValueAtTime(envelope.sustain / frequencies.length, decayEnd);
      gain.gain.setValueAtTime(envelope.sustain / frequencies.length, releaseStart);
      gain.gain.linearRampToValueAtTime(0, releaseStart + envelope.release);

      osc.start(now);
      osc.stop(now + duration);
    });
  }, []);

  const playSound = useCallback((effect: SoundEffect) => {
    if (!soundEnabledRef.current || !audioContextRef.current) return;

    switch (effect) {
      case 'bet':
        // チップを置く音（カジノチップのクリック音）
        playRichSound([800, 1200], 0.08, {attack: 0.001, decay: 0.02, sustain: 0.15, release: 0.05}, 2400);
        setTimeout(() => playRichSound([700, 1050], 0.06, {attack: 0.001, decay: 0.015, sustain: 0.12, release: 0.04}, 2100), 40);
        break;

      case 'fold':
        // カードをフォールドする音（スワイプ＋ドロップ）
        playRichSound([600, 400], 0.15, {attack: 0.01, decay: 0.08, sustain: 0.05, release: 0.06}, 1200);
        setTimeout(() => playRichSound([300, 200], 0.12, {attack: 0.005, decay: 0.06, sustain: 0.03, release: 0.05}, 800), 60);
        break;

      case 'call':
        // コール音（コイン落下音風）
        playRichSound([880, 1320], 0.15, {attack: 0.002, decay: 0.08, sustain: 0.2, release: 0.06}, 2640);
        setTimeout(() => playRichSound([660, 990], 0.12, {attack: 0.002, decay: 0.06, sustain: 0.15, release: 0.05}, 1980), 50);
        break;

      case 'raise':
        // レイズ音（複数のチップ積み上げ）
        playRichSound([523, 784], 0.1, {attack: 0.001, decay: 0.04, sustain: 0.2, release: 0.05}, 1568);
        setTimeout(() => playRichSound([659, 988], 0.1, {attack: 0.001, decay: 0.04, sustain: 0.2, release: 0.05}, 1976), 70);
        setTimeout(() => playRichSound([784, 1176], 0.12, {attack: 0.001, decay: 0.05, sustain: 0.25, release: 0.06}, 2352), 140);
        break;

      case 'allIn':
        // オールイン（ドラマチックなインパクト）
        playRichSound([220, 330, 440, 660], 0.4, {attack: 0.005, decay: 0.15, sustain: 0.3, release: 0.25}, 1320);
        setTimeout(() => playRichSound([277, 415, 554, 831], 0.5, {attack: 0.01, decay: 0.2, sustain: 0.35, release: 0.3}, 1662), 100);
        setTimeout(() => playRichSound([330, 495, 660, 990], 0.6, {attack: 0.015, decay: 0.25, sustain: 0.4, release: 0.35}, 1980), 200);
        break;

      case 'win':
        // 勝利音（きらびやかなファンファーレ）
        playRichSound([523, 659, 784, 1047], 0.25, {attack: 0.01, decay: 0.1, sustain: 0.4, release: 0.14}, 2094);
        setTimeout(() => playRichSound([659, 784, 988, 1319], 0.25, {attack: 0.01, decay: 0.1, sustain: 0.4, release: 0.14}, 2638), 120);
        setTimeout(() => playRichSound([784, 988, 1175, 1568], 0.3, {attack: 0.015, decay: 0.12, sustain: 0.45, release: 0.17}, 3136), 240);
        setTimeout(() => playRichSound([1047, 1319, 1568, 2093], 0.4, {attack: 0.02, decay: 0.15, sustain: 0.5, release: 0.23}, 4186), 360);
        break;

      case 'lose':
        // 負け音（がっかり音）
        playRichSound([440, 330], 0.25, {attack: 0.02, decay: 0.1, sustain: 0.3, release: 0.13}, 660);
        setTimeout(() => playRichSound([330, 247], 0.3, {attack: 0.015, decay: 0.12, sustain: 0.25, release: 0.15}, 494), 120);
        setTimeout(() => playRichSound([247, 185], 0.4, {attack: 0.01, decay: 0.15, sustain: 0.2, release: 0.24}, 370), 240);
        break;

      case 'cardDeal':
        // カード配り（シャープなスワイプ）
        playRichSound([1200, 1800], 0.08, {attack: 0.001, decay: 0.03, sustain: 0.1, release: 0.05}, 3600);
        setTimeout(() => playRichSound([900, 1350], 0.06, {attack: 0.001, decay: 0.02, sustain: 0.08, release: 0.04}, 2700), 25);
        break;

      case 'cardFlip':
        // カードフリップ（パチンと鳴る音）
        playRichSound([1500, 2250], 0.05, {attack: 0.001, decay: 0.02, sustain: 0.12, release: 0.03}, 4500);
        setTimeout(() => playRichSound([1200, 1800], 0.06, {attack: 0.001, decay: 0.025, sustain: 0.1, release: 0.034}, 3600), 30);
        break;

      case 'shuffle':
        // シャッフル音（リアルなシャッフル）
        for (let i = 0; i < 12; i++) {
          setTimeout(() => {
            const baseFreq = 600 + Math.random() * 800;
            playRichSound([baseFreq, baseFreq * 1.5], 0.06, {attack: 0.001, decay: 0.02, sustain: 0.08, release: 0.03}, baseFreq * 2);
          }, i * 60);
        }
        break;

      case 'chipCollect':
        // チップ収集音（カシャカシャと集まる）
        for (let i = 0; i < 7; i++) {
          setTimeout(() => {
            const freq = 700 + i * 80;
            playRichSound([freq, freq * 1.5], 0.07, {attack: 0.001, decay: 0.025, sustain: 0.15, release: 0.035}, freq * 2);
          }, i * 45);
        }
        break;

      case 'timerTick':
        // タイマーチック（控えめなクリック）
        playRichSound([1200], 0.03, {attack: 0.001, decay: 0.01, sustain: 0.05, release: 0.019}, 2400);
        break;

      case 'timerWarning':
        // タイマー警告（緊急ビープ）
        playRichSound([880, 1320], 0.12, {attack: 0.002, decay: 0.05, sustain: 0.25, release: 0.065}, 2640);
        setTimeout(() => playRichSound([880, 1320], 0.12, {attack: 0.002, decay: 0.05, sustain: 0.25, release: 0.065}, 2640), 180);
        break;

      case 'playerJoin':
        // プレイヤー参加（明るい通知音）
        playRichSound([659, 988], 0.12, {attack: 0.005, decay: 0.05, sustain: 0.2, release: 0.065}, 1976);
        setTimeout(() => playRichSound([784, 1176], 0.15, {attack: 0.005, decay: 0.07, sustain: 0.25, release: 0.08}, 2352), 90);
        break;

      case 'playerLeave':
        // プレイヤー退席（落ち着いた通知音）
        playRichSound([523, 784], 0.12, {attack: 0.005, decay: 0.05, sustain: 0.2, release: 0.065}, 1568);
        setTimeout(() => playRichSound([440, 660], 0.15, {attack: 0.005, decay: 0.07, sustain: 0.18, release: 0.08}, 1320), 90);
        break;

      case 'achievement':
        // アチーブメント（キラキラ輝く音）
        playRichSound([1047, 1319, 1568], 0.18, {attack: 0.005, decay: 0.08, sustain: 0.3, release: 0.092}, 3136);
        setTimeout(() => playRichSound([1319, 1568, 1976], 0.2, {attack: 0.007, decay: 0.09, sustain: 0.35, release: 0.104}, 3952), 110);
        setTimeout(() => playRichSound([1568, 1976, 2349], 0.25, {attack: 0.01, decay: 0.11, sustain: 0.4, release: 0.14}, 4698), 220);
        break;

      case 'levelUp':
        // レベルアップ（祝福のファンファーレ）
        playRichSound([523, 659, 784, 1047], 0.25, {attack: 0.01, decay: 0.1, sustain: 0.35, release: 0.14}, 2094);
        setTimeout(() => playRichSound([659, 784, 1047, 1319], 0.35, {attack: 0.015, decay: 0.15, sustain: 0.4, release: 0.185}, 2638), 160);
        break;

      default:
        break;
    }
  }, [playRichSound]);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    soundEnabledRef.current = enabled;
  }, []);

  return {
    playSound,
    setSoundEnabled,
  };
};
