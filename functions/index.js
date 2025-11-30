// entry point with V2 syntax

const {onCall, HttpsError}= require("firebase-functions/v2/https");
const {onSchedule} = require("firebase-functions/v2/scheduler");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
require("dotenv").config();

admin.initializeApp();
const db = admin.firestore();

const {getArticles, scrapeArticles} = require("./apiHelpers");
const {generateSummary} = require("./digestHelpers");

const checkRateLimit = async (userId) => {
  const lastDigestSnap = await db.collection("digests")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .limit(1)
    .get();

  if (lastDigestSnap.empty) return true; // continue if there is no digest today (i.e. user manually ask for digest before 5am)

  const lastDigest = lastDigestSnap.docs[0].data();
  if (!lastDigest.createdAt) return true; // continue if createdAt field is empty

  const lastRun = lastDigest.createdAt.toDate();
  const now = new Date();
  const diffMinutes = (now - lastRun) / 1000 / 60;

  if (diffMinutes < 15) {
    throw new HttpsError(
      "resource-exhausted",
      `Please wait ${Math.ceil(15 - diffMinutes)} minutes before refreshing.`
    );
  }
  return true;
};

const generateDigestForUser = async (userId) => {
  logger.info(`Starting digest generation for user: ${userId}`)

  const profileRef = db.collection("profiles").doc(userId);
  const profileSnap = await profileRef.get();

  if(!profileSnap.exists) {
    throw new Error("User profile not found");
  }

  const profile = profileSnap.data();
  const topic = profile.topic || "Technology";
  const tone = profile.gemini_settings?.tone || "Informative";
  const format = profile.gemini_settings?.format || "A concise summary";

  // fetch news
  const articles = await getArticles(topic);
  if(!articles || articles.length === 0) {
    logger.warn(`No articles found for topic: ${topic}`);
    return {success: false, message: "No articles found for topic"};
  }

  //process articles at the same time
  const processingPromises = articles.map(async (article) => {
    try {
      // Scrape
      const markdown = await scrapeArticles(article.url);
      if(!markdown) {
        return null; // skip this url if scraping fails
      }

      // summarize
      const summary = await generateSummary(markdown, tone, format);
      if(!summary) {
        return null;
      }

      // return the combined result
      return {
        subheading: summary.headline,
        synopsis: summary.synopsis,
        key_takeaway: summary.key_takeaway,
        sentiment: summary.sentiment,
        source_url: article.url,
        original_title: article.title,
      };
    } catch (error) {
      logger.error(`Failed to process article: ${article.url}`, error);
      return null;
    }
  });


  const results = await Promise.allSettled(processingPromises);

  const validSections = results
    .filter((r) => r.status === "fulfilled" && r.value !== null)
    .map((r) => r.value);

  if (validSections.length === 0) {
    throw new Error(`All articles failed to process.`);
  }

  const overallTakeaways = validSections.map((s) => s.key_takeaway);

  const digestData = {
    userId: userId,
    topic: topic,
    overall_key_takeaways: overallTakeaways,
    article_sections: validSections,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await db.collection("digests").add(digestData);
  logger.info(`Digest created successfully for ${userId}`);

  return {success:true, count: validSections.length};

}



exports.generateManualDigest = onCall(
  {timeoutSeconds: 300}, // 5min timeout for long processing
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be logged in.");
    }

    try {
      // Check Rate Limit
      await checkRateLimit(request.auth.uid);

      const result = await generateDigestForUser(request.auth.uid);
      return result;
    } catch (e) {
      if (e.code) throw e;
      logger.error("Failed to Manually generate Digest:", e);
      throw new HttpsError("internal", e.message);
    }
  }
  );


exports.dailyDigestJob = onSchedule(
  {
    schedule: '0 5 * * *',
    timeZone: 'America/Edmonton',
    timeoutSeconds: 540,
  },
  async event => {
    logger.info('Starting Daily Digest Job...');

    const profileSnap = await db.collection('profiles').get();

    const batchPromises = profileSnap.docs.map(doc =>
      generateDigestForUser(doc.id),
    );
    await Promise.allSettled(batchPromises);
    logger.info(`Finished Daily Digest Job...`);
  },
);