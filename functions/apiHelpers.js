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

}

// handle NesAPI and FireCrawl logic
module.exports = {
}

// Handle Gemini logic
module.exports = {

}