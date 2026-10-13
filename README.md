# MindPal-Companion  🌟

**Your Personal AI-Powered 3D Companion**

MindPal is an interactive personal assistant application featuring **Luma**, a friendly 3D companion designed to help users stay organized, manage daily activities, track expenses, and improve productivity.

The application supports both laptop browsers and Android devices.

## ✨ Features

- **3D Luma Companion** – Interactive mascot with animations, expressions, and reactions.
- **AI Chat** – Have conversations with Luma using Google Gemini.
- **Mood Tracker** – Record daily moods and enjoy mood-based activities.
- **Task Management** – Create, edit, complete, and organize daily tasks.
- **Calendar** – Plan and manage activities and schedules.
- **Money Management** – Track income, expenses, budgets, and financial reports.
- **AI Recommendations** – Receive helpful planning and financial suggestions.
- **User Accounts** – Email/password authentication and Google sign-in.

## 🛠️ Technologies Used

- HTML, CSS, JavaScript
- Three.js (3D Mascot)
- Node.js
- MongoDB
- Google Gemini API
- Android Java WebView

## 🚀 Installation & Setup

### Step 1: Requirements

Install the following:

- Node.js and npm
- MongoDB database (local or cloud)
- Google Gemini API key for AI features

### Step 2: Download the Project

Clone the repository or download it as a ZIP file and extract it.

Open a terminal inside the main project folder.

### Step 3: Install Dependencies

```bash
npm ci
```

### Step 4: Configure the Project
    ## 🔑 API Key & Database Configuration

After running:

```bash
npm run setup
```

Open the `.env` file created in the main project folder.

Add your own Google Gemini API key and MongoDB connection URI Or Use These keys:

## 🔑 Gemini API Key

To enjoy the full MindPal experience, including AI-powered conversations with Luma, please create your own **free Gemini API key** using the link below:

👉 **[Get Your Gemini API Key – Google AI Studio](https://aistudio.google.com/apikey)**

After generating your API key, open the `.env` file in the project folder and paste it as follows:

```env
GEMINI_API_KEY=YOUR_API_KEY_HERE
```

Save the file and run `npm run check:services` to verify the connection.

**Note:** Keep your API key private and never upload it to GitHub. Free-tier access is subject to Google's usage limits and availability.

## MongoDB URI:
MONGODB_URI=mongodb://dbuser2e3yad:MindPal2026@fc-e405ade918c2-000.global.mongocluster.cosmos.azure.com:10260/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000MONGODB_DB=mindpal


**Where to get the credentials:**

- **Gemini API Key:** [Google AI Studio](https://aistudio.google.com/apikey)
- **MongoDB URI:** [MongoDB Atlas](https://cloud.mongodb.com/)

Save the `.env` file after adding your credentials.

**After entering your API key and MongoDB connection URI, verify that both are in the correct format. Once confirmed, save the `.env` file and proceed with the following commands.**

### Step 5: Check Services

```bash
npm run check:services
```

### Step 6: Set Up Database

```bash
npm run db:setup
```

### Step 7: Start the Application

```bash
npm start
```

Open your browser and visit:

**http://localhost:3000**

## 📱 Android Application

MindPal also supports Android through a WebView APK.

The Android version requires access to the running backend server. Follow the Android and HTTPS setup instructions in the documentation.

## 🧪 Testing

Run the available project tests:

```bash
npm test
npm run check
```

## 📖 Documentation

- [Complete Setup Guide](docs/UPDATE-.md)
- [Testing Results](docs/TEST-RESULTS.md)

## 🔒 Security

- Never upload `.env` files or API keys to GitHub.
- Keep database credentials and signing keys private.
- Use environment variables for sensitive configuration.
- Export local data before uninstalling older APK versions.

## 📌 Version

**MindPal - Companion**

An updated version of MindPal 1.1, preserving the original Luma companion and improving the application's features and integrations.

---

**Made with ❤️ for smarter daily living.**
