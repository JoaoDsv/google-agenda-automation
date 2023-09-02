const { google } = require("googleapis");
const { OAuth2Client } = require("google-auth-library");

// Read API authentication key
const credentials = require("/Users/jdsvm//Secret-Keys/google_calendar_api_client_secret.json");
const { client_id, client_secret, redirect_uris } = credentials.installed;

// Configure OAuth2Client
const oAuth2Client = new OAuth2Client(
  client_id,
  client_secret,
  redirect_uris[0]
);

// Authorise access to Google Agenda
const SCOPES = ["https://www.googleapis.com/auth/calendar"];

function createEvent() {
  try {
    // API connection
    const calendar = google.calendar({
      version: "v3",
      auth: oAuth2Client,
    });

    console.log("API connected ✅", response.data.htmlLink);
  } catch (error) {
    console.error("Error connecting to the API:", error);
  }
}
