import {View, Text, StyleSheet, TouchableOpacity, Linking} from 'react-native';

const ArticleCard = ({article}) => {
  const openLink = () => {
    if(article.source_url) {
      Linking.openURL(article.source_url);
    }
  };

  const getSentimentColor = (sentiment) => {
    switch(sentiment) {
      case 'Positive': return 'green';
      case 'Negative': return 'red';
      case 'Controversial': return 'orange';
      default: return 'grey'; // neutral
    }
  };

  return (
    <View style={styles.card}>
      {/* Header: Sentiment & Title */}
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: getSentimentColor(article.sentiment) }]}>
          <Text style={styles.badgeText}>
            {article.sentiment || 'Neutral'}
          </Text>
        </View>
        <Text style={styles.headline}>
          {article.subheading}
        </Text>
      </View>

      {/* Body: The AI Summary */}
      <Text style={styles.synopsis}>{article.synopsis}</Text>

      {/* Footer: Key Takeaway & Link */}
      <View style={styles.footer}>
        <Text style={styles.takeawayLabel}>💡 Key Takeaway:</Text>
        <Text style={styles.takeawayText}>{article.key_takeaway}</Text>

        <TouchableOpacity onPress={openLink} style={styles.readMoreBtn}>
          <Text style={styles.readMoreText}>Read Original Article -></Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3, // android shadow
    shadowColor: '#000', //IOS shadow
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    marginBottom: 12
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
  },
  headline: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 24
  },
  synopsis: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 12
  },
  footer: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8
  },
  takeawayLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 4
  },
  takeawayText: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
    marginBottom: 12
  },
  readMoreBtn: {
    alignSelf: 'flex-end'
  },
  readMoreText: {
    color: '#007bff',
    fontWeight: '600'
  },
});