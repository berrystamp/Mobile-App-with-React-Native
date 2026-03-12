// src/components/common/Header.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Header = ({ 
  type = 'main', // 'main', 'search', 'back'
  title,
  onSearchPress,
  onNotificationPress,
  onBackPress,
  rightAction,
  rightActionText,
  onRightAction,
}) => {
  if (type === 'main') {
    return (
      <View style={styles.headerMain}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <View style={styles.logoShape} />
          </View>
          <Text style={styles.logoText}>Berrystamp</Text>
        </View>
        <View style={styles.headerIcons}>
          {onSearchPress && (
            <TouchableOpacity style={styles.iconBtn} onPress={onSearchPress}>
              <Ionicons name="search-outline" size={24} color="#000" />
            </TouchableOpacity>
          )}
          {onNotificationPress && (
            <TouchableOpacity style={styles.iconBtn} onPress={onNotificationPress}>
              <Ionicons name="notifications-outline" size={24} color="#000" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  if (type === 'back') {
    return (
      <View style={styles.headerBack}>
        <TouchableOpacity onPress={onBackPress} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        {rightAction && (
          <TouchableOpacity onPress={onRightAction}>
            <Text style={styles.rightActionText}>{rightActionText}</Text>
          </TouchableOpacity>
        )}
        {!rightAction && <View style={{ width: 60 }} />}
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  headerMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFF',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#4A3F8F',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoShape: {
    width: 20,
    height: 20,
    backgroundColor: '#FFF',
    borderRadius: 10,
    transform: [{ rotate: '45deg' }],
  },
  logoText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  iconBtn: {
    padding: 4,
  },
  headerBack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  rightActionText: {
    fontSize: 14,
    color: '#4A3F8F',
    fontWeight: '500',
  },
});

export default Header;