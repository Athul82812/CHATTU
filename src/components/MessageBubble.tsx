import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MessageBubbleProps {
  text: string;
  isOwnMessage: boolean;
  timestamp: Date;
  isRead?: boolean;
}

const formatTime = (date: Date): string => {
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

const MessageBubble: React.FC<MessageBubbleProps> = ({
  text,
  isOwnMessage,
  timestamp,
  isRead,
}) => {
  return (
    <View style={[styles.wrapper, isOwnMessage ? styles.wrapperRight : styles.wrapperLeft]}>
      <View
        style={[
          styles.bubble,
          isOwnMessage ? styles.ownBubble : styles.otherBubble,
        ]}
      >
        <Text style={[styles.messageText, isOwnMessage ? styles.ownText : styles.otherText]}>
          {text}
        </Text>
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
