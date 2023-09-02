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

function main() {
  readToken("access_token", "access-token.json");
  readToken("refresh_token", "refresh-token.json");

  oAuth2Client.setCredentials(tokens);
  createEvent();
}

function readToken(tokenName, tokenFile) {
  fs.readFile(tokenFile, (error, token) => {
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

main();
