const axios = require('axios');
const logger = require("firebase-functions/logger");

// get Date for "yesterday" because we want the news from the past 24-hours
// NewsAPI requires ISO 8601 format
const getYesterdayISO = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
};

// Fetch Articles using the NewAPI.org Everything endpoint
const getArticles = async (topic) => {
  const apiKey = process.env.NEWS_API_KEY;
  if(!apiKey) {
    throw new Error('Missing NEWS_API_KEY');
  }

  // This will enforce a 5-word limit for the topic. Frontend will also enforce this
  const sanitizedTopic = topic.split(' ').slice(0, 5).join(' ');

  const fromDate = getYesterdayISO();

  /***
    Endpoint: /v2/everything
    Parameters:
    q: The user's topic
    from: Only articles from the last 24 hours
    sortBy: 'popularity' finds the most popular articles first
    language: 'en' restricts to English
  ***/
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(sanitizedTopic)}&from=${fromDate}&sortBy=popularity&language=en&pageSize=5&apiKey=${apiKey}`;

  logger.info('Fetching articles using the URL: ', url);

  try {
    const response = await axios.get(url);
    if(response.data.status !== 'ok') {
      throw new Error(`News API response Error:  ${response.data.message}`);
    }

    return response.data.articles;
  }catch (error) {
    logger.error("NewsAPI Failed", error);
    return []; // returning empty so the app wont crash
  }
}

// handle NesAPI and FireCrawl logic
module.exports = {
}

// Handle Gemini logic
module.exports = {

}