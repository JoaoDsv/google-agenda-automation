const { google } = require("googleapis");
const fs = require("fs");
const readline = require("readline");
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
let tokens = { access_token: "", refresh_token: "" };

async function main() {
  await readToken("access_token", "access-token.json");
  await readToken("refresh_token", "refresh-token.json");

  console.log("setting up credentials...");

  setTimeout(() => {
    console.log("creating events...");
    return oAuth2Client.setCredentials(tokens);
  }, 3000);

  setTimeout(async () => await createEvents(), 6000);
}

async function readToken(tokenName, tokenFile) {
  await fs.readFile(tokenFile, (error, token) => {
    if (error) {
      console.log(`No ${tokenFile} found.`);

      authorize();
    } else {
      tokens[tokenName] = JSON.parse(token);
      console.log(`Existing ${tokenFile} file found ✅`, tokens[tokenName]);
    }
  });
}

function authorize() {
  try {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
    });

    console.log("Authorize this app by visiting this URL: ", authUrl);

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question("Enter the code from that page here: ", async (code) => {
      rl.close();
      const { tokens } = await oAuth2Client.getToken(code);

      oAuth2Client.setCredentials(tokens);
      saveToken(tokens);
    });
  } catch (error) {
    console.error("Error in authorization:", error.message);
  }
}

// Persist tokens in JSON files
function saveToken(tokens) {
  try {
    fs.writeFileSync("access-token.json", JSON.stringify(tokens.access_token));
    console.log("Token saved to access-token.json ✅");
  } catch (error) {
    console.error("Error saving access_token:", error);
  }

  try {
    fs.writeFileSync(
      "refresh-token.json",
      JSON.stringify(tokens.refresh_token)
    );
    console.log("Token saved to refresh-token.json ✅");
  } catch (error) {
    console.error("Error saving refresh_token:", error);
  }
}

async function createEvents() {
  // Build event properties
  const eventDetails = {
    summary: "🥥 Breakfast",
    start: {
      dateTime: "2023-09-03T10:00:00", // Start datetime at ISO format
      timeZone: "CET",
    },
    end: {
      dateTime: "2023-09-03T10:45:00", // End datetime at ISO format
      timeZone: "CET",
    },
    recurrence: ["RRULE:FREQ=DAILY;COUNT=30"], // Daily recurrence for 30 days
  };

  try {
    // API connection
    const calendar = google.calendar({
      version: "v3",
      auth: oAuth2Client,
    });

    // Request events creation
    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: eventDetails,
    });

    console.log("✅ Events created: %s", response.data.htmlLink);
  } catch (error) {
    console.error("Error creating events:", error);
  }
}

main();
