import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface ModernHeaderProps {
  title?: string;
  subtitle?: string;
  onAddPress?: () => void;
  onSearchPress?: () => void;
  showAddButton?: boolean;
  showSearchButton?: boolean;
}

const ModernHeader: React.FC<ModernHeaderProps> = ({ 
  title = "Kütüphanem", 
  subtitle = "11 hikaye",
  onAddPress,
  onSearchPress,
  showAddButton = true,
  showSearchButton = true 
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        {showAddButton ? (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={onAddPress}
            activeOpacity={0.7}
          >
            <Text style={styles.addIcon}>+</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.spacer} />
        )}
        
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        
        {showSearchButton ? (
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={onSearchPress}
            activeOpacity={0.7}
          >
            <Text style={styles.searchIcon}>🔍</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.spacer} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  addIcon: {
    fontSize: 28,
    fontWeight: '300',
    color: '#1F2937',
    lineHeight: 28,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 2,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  searchIcon: {
    fontSize: 20,
  },
  spacer: {
    width: 44,
  },
});

export default ModernHeader;
