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
  const masterCompressorRef = useRef<DynamicsCompressorNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const reverbNodeRef = useRef<ConvolverNode | null>(null);
  const reverbGainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = ctx;

      // オーディオチェーンの構築: リバーブ -> コンプレッサー -> マスターゲイン -> destination
      
      // マスターゲイン（全体音量調整）
      masterGainRef.current = ctx.createGain();
      masterGainRef.current.gain.value = 0.8;
      masterGainRef.current.connect(ctx.destination);

      // マスターコンプレッサー（プロのミックス）
      masterCompressorRef.current = ctx.createDynamicsCompressor();
      masterCompressorRef.current.threshold.value = -20;
      masterCompressorRef.current.knee.value = 30;
      masterCompressorRef.current.ratio.value = 8;
      masterCompressorRef.current.attack.value = 0.003;
      masterCompressorRef.current.release.value = 0.25;
      masterCompressorRef.current.connect(masterGainRef.current);

      // リバーブ（空間の深み）
      reverbNodeRef.current = ctx.createConvolver();
      const reverbBuffer = createReverbImpulse(ctx, 1.5, 3, false);
      reverbNodeRef.current.buffer = reverbBuffer;
      
      reverbGainRef.current = ctx.createGain();
      reverbGainRef.current.gain.value = 0.15; // リバーブの深さ
      reverbNodeRef.current.connect(reverbGainRef.current);
      reverbGainRef.current.connect(masterCompressorRef.current);
    }
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const createReverbImpulse = (ctx: AudioContext, duration: number, decay: number, reverse: boolean) => {
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * duration;
    const impulse = ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = reverse ? length - i : i;
      left[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
      right[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
    }
    return impulse;
  };

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

  const playRichSound = useCallback(async (frequencies: number[], duration: number, envelope: {attack: number, decay: number, sustain: number, release: number}, filterFreq?: number, wetDryMix: number = 0.3) => {
    if (!soundEnabledRef.current || !audioContextRef.current || !masterCompressorRef.current) return;

    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') await ctx.resume();

    frequencies.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const eq = ctx.createBiquadFilter();
      const wetGain = ctx.createGain();
      const dryGain = ctx.createGain();

      // サウンド生成
      osc.type = index % 2 === 0 ? 'sawtooth' : 'triangle'; // レイヤリング
      osc.frequency.value = freq + (Math.random() * 2 - 1); // デチューン
      
      // ローパスフィルター
      filter.type = 'lowpass';
      filter.frequency.value = filterFreq || freq * 2;
      filter.Q.value = 2;

      // EQシェルビング（高域を明るく）
      eq.type = 'highshelf';
      eq.frequency.value = 2000;
      eq.gain.value = 3;

      // Wet/Dry ミックス
      wetGain.gain.value = wetDryMix;
      dryGain.gain.value = 1 - wetDryMix;

      // ドライ信号チェーン
      osc.connect(filter);
      filter.connect(eq);
      eq.connect(gain);
      gain.connect(dryGain);
      dryGain.connect(masterCompressorRef.current!);

      // ウェット信号チェーン（リバーブ）
      if (reverbNodeRef.current) {
        gain.connect(wetGain);
        wetGain.connect(reverbNodeRef.current);
      }

      const now = ctx.currentTime;
      const attackEnd = now + envelope.attack;
      const decayEnd = attackEnd + envelope.decay;
      const releaseStart = now + duration - envelope.release;

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.35 / frequencies.length, attackEnd);
      gain.gain.linearRampToValueAtTime(envelope.sustain / frequencies.length, decayEnd);
      gain.gain.setValueAtTime(envelope.sustain / frequencies.length, releaseStart);
      gain.gain.linearRampToValueAtTime(0, releaseStart + envelope.release);

      osc.start(now);
      osc.stop(now + duration);
    });
  }, []);

  const playChipSound = useCallback(async (intensity: number = 1, variation: number = 0) => {
    if (!soundEnabledRef.current || !audioContextRef.current || !masterCompressorRef.current) return;

    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') await ctx.resume();

    // レイヤー1: ホワイトノイズでカチャカチャ感
    const bufferSize = ctx.sampleRate * 0.06;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.4;
      }
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 3500 + Math.random() * 1500 + variation * 500;
    noiseFilter.Q.value = 4;

    const noiseEQ = ctx.createBiquadFilter();
    noiseEQ.type = 'peaking';
    noiseEQ.frequency.value = 4000;
    noiseEQ.Q.value = 2;
    noiseEQ.gain.value = 6; // ブースト

    const noiseGain = ctx.createGain();
    const wetGain = ctx.createGain();
    const dryGain = ctx.createGain();

    wetGain.gain.value = 0.2;
    dryGain.gain.value = 0.8;

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseEQ);
    noiseEQ.connect(noiseGain);
    noiseGain.connect(dryGain);
    dryGain.connect(masterCompressorRef.current);

    if (reverbNodeRef.current) {
      noiseGain.connect(wetGain);
      wetGain.connect(reverbNodeRef.current);
    }

    const now = ctx.currentTime;
    noiseGain.gain.setValueAtTime(0.5 * intensity, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    noise.start(now);
    noise.stop(now + 0.06);

    // レイヤー2 & 3: プラスチック/セラミックの響き（複雑な倍音）
    const resonances = [900, 1800, 2700, 3600, 5400];
    resonances.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const wetGain2 = ctx.createGain();
      const dryGain2 = ctx.createGain();

      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.value = freq + Math.random() * 150 + variation * 100;

      filter.type = 'bandpass';
      filter.frequency.value = freq;
      filter.Q.value = 12 + Math.random() * 4;

      wetGain2.gain.value = 0.25;
      dryGain2.gain.value = 0.75;

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(dryGain2);
      dryGain2.connect(masterCompressorRef.current!);

      if (reverbNodeRef.current) {
        gain.connect(wetGain2);
        wetGain2.connect(reverbNodeRef.current);
      }

      const volume = (0.2 / (i + 1)) * intensity;
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04 + i * 0.008);

      osc.start(now + i * 0.002); // わずかにずらして深みを出す
      osc.stop(now + 0.06);
    });

    // レイヤー4: 低域の「ドン」という音（重量感）
    const bass = ctx.createOscillator();
    const bassGain = ctx.createGain();
    const bassFilter = ctx.createBiquadFilter();

    bass.type = 'sine';
    bass.frequency.value = 120 + Math.random() * 30;

    bassFilter.type = 'lowpass';
    bassFilter.frequency.value = 300;
    bassFilter.Q.value = 1;

    bass.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(masterCompressorRef.current!);

    bassGain.gain.setValueAtTime(0.15 * intensity, now);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    bass.start(now);
    bass.stop(now + 0.03);
  }, []);

  const playSound = useCallback((effect: SoundEffect) => {
    if (!soundEnabledRef.current || !audioContextRef.current) return;

    switch (effect) {
      case 'bet':
        // チップを置く音（リアルなカジノチップ）
        playChipSound(0.9, 0);
        setTimeout(() => playChipSound(0.7, 1), 55);
        break;

      case 'fold':
        // カードをフォールドする音（スワイプ＋ドロップ）
        playRichSound([600, 400], 0.15, {attack: 0.01, decay: 0.08, sustain: 0.05, release: 0.06}, 1200, 0.4);
        setTimeout(() => playRichSound([300, 200], 0.12, {attack: 0.005, decay: 0.06, sustain: 0.03, release: 0.05}, 800, 0.5), 60);
        break;

      case 'call':
        // コール音（チップを押し出す）
        playChipSound(1.0, 0);
        setTimeout(() => playChipSound(0.8, 1), 65);
        setTimeout(() => playChipSound(0.6, 2), 120);
        break;

      case 'raise':
        // レイズ音（複数のチップ積み上げ）
        playChipSound(1.0, 0);
        setTimeout(() => playChipSound(0.85, 1), 75);
        setTimeout(() => playChipSound(0.95, 0), 150);
        setTimeout(() => playChipSound(0.75, 2), 210);
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
        for (let i = 0; i < 10; i++) {
          setTimeout(() => {
            const intensity = 0.6 + Math.random() * 0.4;
            const variation = Math.floor(Math.random() * 3);
            playChipSound(intensity, variation);
          }, i * 48);
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
  }, [playRichSound, playChipSound]);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    soundEnabledRef.current = enabled;
  }, []);

  return {
    playSound,
    setSoundEnabled,
  };
};
