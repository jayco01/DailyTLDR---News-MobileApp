# **Daily TL;DR**

**Team:** Code & Chronicle

**Members:** Jay Layco, Ashley Shaw-Strand, Jack Gess

**Daily TL;DR** is a personalized, privacy-first news aggregator built for Android. Unlike standard news apps that bombard users with infinite feeds, this app generates a single, finite Daily Digest every morning at 5:00 AM using AI to scrape, summarize, and curate content based on the user's preferred topic.

## **Key Features**

* **AI-Powered Summaries:** Uses **Google Gemini (Flash 2.5)** to transform complex articles into concise bullet points and 3-sentence synopses.
* **Time Travel Carousel:** Users can swipe back to view digests from the past 7 days (Read-Time Aggregation).
* **Audio Mode:** Native Text-to-Speech (TTS) integration allows users to listen to their news while commuting.
* **Dynamic Theming:** Full Dark Mode support that persists across app launches.
* **Rate Limiting:** Server-side protection prevents API quota exhaustion by enforcing a 15-minute cooldown on manual refreshes.

## **Tech Stack & Architecture**

### **Frontend (Client)**

* **Framework:** React Native (0.76+)
* **State Management:** React Context API (Auth, Theme, Settings)
* **Persistence:** Firestore (User Data) \+ AsyncStorage (Local Preferences)
* **Pattern:** Modular Firebase SDK (Functional Programming style)

### **Backend (Serverless)**

* **Platform:** Firebase Cloud Functions (Gen 2\)
* **Runtime:** Node.js 20
* **Scheduling:** Google Cloud Scheduler (Cron Jobs)
* **External APIs:** NewsAPI (Discovery), Firecrawl (ETL/Scraping), Google Gemini (Summarization)

## **Core Computer Science Concepts**

This project implements several advanced distributed system patterns:

### **1\. The "Scatter-Gather" Pattern (Parallel Processing)**

Instead of processing news articles sequentially (which would be slow), our backend utilizes concurrency:

1. **Scatter:** The system spawns 5 parallel promises to scrape (Firecrawl) and summarize (Gemini) articles simultaneously.
2. **Gather:** using Promise.allSettled, the system collects the results.
3. **Fault Tolerance:** If one article fails (e.g., paywall), the digest still generates successfully with the remaining data (Fail-Open Design).

### **2\. Read-Time Aggregation (Data Structures)**

To solve the "Greatest-N-Per-Group" problem (showing only the latest digest for each of the last 7 days), we shifted compute to the client:

* **Query:** Fetches the last 7 days of raw data.
* **Algorithm:** Uses a **H**ash Set (Set\<String\>) in the React Native client to filter duplicates in O(1) time complexity, ensuring the UI remains responsive.

### **3\. Determinism in AI**

Large Language Models are probabilistic. We enforced **Determinism** by strictly defining a **JSON Schema** for the Gemini API. This guarantees that the AI output is always valid JSON structure, preventing UI crashes caused by "hallucinated" formats.

## **Getting Started**

### **Prerequisites**

* Node.js (v18+)
* Java Development Kit (JDK 17\)
* Android Studio (for Emulator)

### **Installation**

1. **Clone the repository:**  
   git clone [\[https://github.com/your-repo/daily-tldr.git\](https://github.com/your-repo/daily-tldr.git) ](https://github.com/jayco01/DailyTLDR---News-MobileApp.git) 
   cd daily-tldr

2. **Install Dependencies:**  
   npm install  
   cd functions && npm install && cd ..

3. Environment Setup:  
   Create a .env file in the root:  
   NEWS\_API\_KEY=your\_key\_here  
   FIRECRAWL\_API\_KEY=your\_key\_here  
   GEMINI\_API\_KEY=your\_key\_here

4. **Run the App:**  
   npm run android

\*Academic Project for SAIT Software
