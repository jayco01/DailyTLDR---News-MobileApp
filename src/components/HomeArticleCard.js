import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { colors } from '../theme/colors';
import Icon from 'react-native-vector-icons/MaterialIcons';

const HomeArticleCard = ({ article }) => {
  const openLink = () => {
    if (article.source_url) Linking.openURL(article.source_url);
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'Positive': return colors.success;
      case 'Negative': return colors.error;
      case 'Controversial': return '#ff9800';
      default: return colors.dark;
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: getSentimentColor(article.sentiment) }]}>
          <Text style={styles.badgeText}>{article.sentiment || 'Neutral'}</Text>
        </View>
        <Text style={styles.headline}>{article.subheading}</Text>
      </View>

      <Text style={styles.synopsis}>{article.synopsis}</Text>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.source} onPress={openLink}>
          <Text style={styles.readMoreText}>Read Source </Text>
          <Icon name="open-in-new" size={16} color={colors.primary}/>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: colors.dark,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: { marginBottom: 12 },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  headline: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.darkest,
    lineHeight: 24
  },
  synopsis: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
    marginBottom: 12
  },
  footer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8
  },
  takeawayLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4
  },
  takeawayText: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
    marginBottom: 10
  },
  readMoreText: {
    color: colors.light,
    fontWeight: '600'
  },
  source: {
    flexDirection: "row"
  }
});

export default HomeArticleCard;