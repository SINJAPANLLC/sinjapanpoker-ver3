'use client';

import { useState, useEffect } from 'react';
import { User, Menu, MessageCircle, Volume2, VolumeX, Music, Wifi, WifiOff, Maximize, Minimize, Info, History, Eye } from 'lucide-react';
import Card from '@/components/Card';
import { Card as CardType, Suit, Rank } from '@/types';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useSoundManager } from '@/hooks/useSoundManager';
import { useMoneyModeStore } from '@/store/useMoneyModeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { usePokerGame } from '@/hooks/usePokerGame';
import { useSearchParams, useRouter } from 'next/navigation';

// Rest of the component will be imported from page.tsx
export { default } from '../active/page';
