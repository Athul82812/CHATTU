import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  useAudioPlayer,
  useAudioPlayerStatus,
  setAudioModeAsync,
} from 'expo-audio';

interface MessageBubbleProps {
  text: string;
  isOwnMessage: boolean;
  timestamp: Date;
  isRead?: boolean;
  audioUrl?: string;
  duration?: number;
}

const formatTime = (date: Date): string => {
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const AudioPlayer: React.FC<{ audioUrl: string; duration?: number; isOwn: boolean }> = ({ audioUrl, duration, isOwn }) => {
  const player = useAudioPlayer(audioUrl);
  const status = useAudioPlayerStatus(player);

  const togglePlayback = async () => {
    try {
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });
      if (status.playing) {
        player.pause();
      } else {
        player.play();
      }
    } catch (e) {
      console.error('Failed to toggle playback:', e);
    }
  };

  const progress = status.duration > 0 ? status.currentTime / status.duration : 0;
  const currentSec = Math.floor(status.currentTime);

  return (
    <View style={styles.audioContainer}>
      <TouchableOpacity onPress={togglePlayback} style={styles.playButton}>
        <Text style={styles.playIcon}>{status.playing ? '⏸' : '▶'}</Text>
      </TouchableOpacity>
      <View style={styles.audioTrack}>
        <View style={[styles.audioProgress, { width: `${Math.min(progress * 100, 100)}%` }]} />
      </View>
      <Text style={[styles.audioDuration, isOwn ? styles.ownTime : styles.otherTime]}>
        {formatDuration(currentSec)} / {formatDuration(duration || Math.floor(status.duration))}
      </Text>
    </View>
  );
};

const MessageBubble: React.FC<MessageBubbleProps> = ({
  text,
  isOwnMessage,
  timestamp,
  isRead,
  audioUrl,
  duration,
}) => {
  return (
    <View style={[styles.wrapper, isOwnMessage ? styles.wrapperRight : styles.wrapperLeft]}>
      <View
        style={[
          styles.bubble,
          isOwnMessage ? styles.ownBubble : styles.otherBubble,
        ]}
      >
        {audioUrl ? (
          <AudioPlayer audioUrl={audioUrl} duration={duration} isOwn={isOwnMessage} />
        ) : (
          <Text style={[styles.messageText, isOwnMessage ? styles.ownText : styles.otherText]}>
            {text}
          </Text>
        )}
        <View style={styles.metaRow}>
          <Text style={[styles.timeText, isOwnMessage ? styles.ownTime : styles.otherTime]}>
            {formatTime(timestamp)}
          </Text>
          {isOwnMessage && (
            <Text style={styles.readReceipt}>
              {isRead ? '✓✓' : '✓'}
            </Text>
          )}
        </View>
      </View>
      {/* Tail */}
      <View
        style={[
          styles.tail,
          isOwnMessage ? styles.ownTail : styles.otherTail,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 3,
    marginHorizontal: 12,
    maxWidth: '78%',
    position: 'relative',
  },
  wrapperRight: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  wrapperLeft: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 13,
    paddingVertical: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  ownBubble: {
    backgroundColor: '#FFE0B2',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },
  ownText: {
    color: '#212121',
  },
  otherText: {
    color: '#212121',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 3,
  },
  timeText: {
    fontSize: 11,
  },
  ownTime: {
    color: '#8D6E63',
  },
  otherTime: {
    color: '#9E9E9E',
  },
  readReceipt: {
    fontSize: 11,
    color: '#FF8C00',
    fontWeight: '600',
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 180,
    paddingVertical: 4,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF8C00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  audioTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
  },
  audioProgress: {
    height: '100%',
    backgroundColor: '#FF8C00',
    borderRadius: 3,
  },
  audioDuration: {
    fontSize: 11,
    minWidth: 50,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  tail: {
    position: 'absolute',
    bottom: 0,
    width: 10,
    height: 10,
  },
  ownTail: {
    right: -4,
  },
  otherTail: {
    left: -4,
  },
});

export default MessageBubble;
