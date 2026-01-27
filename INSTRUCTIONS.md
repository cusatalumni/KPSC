
# Setup Guide: Google Sheets as a Database for Kerala PSC Guru

Follow these steps to configure your application to use Google Sheets for storing and retrieving scraped data. This setup is required for the daily cron job to function correctly.

## Part 1: Google Cloud & Sheets Setup

### Step 1: Create a Google Sheet
1. Go to [sheets.google.com](https://sheets.google.com) and create a new, blank spreadsheet.
2. Name it something memorable, like "Kerala PSC Guru Data".
3. **Crucially, create seven tabs at the bottom and name them exactly as follows (case-sensitive):**
    - `Notifications`
    - `LiveUpdates`
    - `CurrentAffairs`
    - `GK`
    - `QuestionBank`
    - `Bookstore`
    - `StudyMaterialsCache`

4. In the `Notifications` tab, add these headers in the first row, one in each cell from A1 to E1:
    `id`, `title`, `categoryNumber`, `lastDate`, `link`

5. In the `LiveUpdates` tab, add these headers:
    `title`, `url`, `section`, `published_date`

6. In the `CurrentAffairs` tab, add these headers:
    `id`, `title`, `source`, `date`

7. In the `GK` tab, add these headers:
    `id`, `fact`, `category`

8. In the `QuestionBank` tab, add these headers:
    `id`, `topic`, `question`, `options`, `correctAnswerIndex`

9. In the `Bookstore` tab, add these headers:
    `id`, `title`, `author`, `imageUrl`, `amazonLink`

10. In the `StudyMaterialsCache` tab, add these headers:
    `topic`, `content`, `lastGenerated`

11. From the URL of your spreadsheet, copy the **Spreadsheet ID**. It's the long string of characters between `/d/` and `/edit`.
   - Example URL: `https://docs.google.com/spreadsheets/d/THIS_IS_THE_ID/edit`
   - Keep this ID handy. You will need it for your environment variables.

### Step 2: Create a Google Cloud Service Account
This creates a secure "robot" user that your Vercel function can use to access the sheet without using your personal Google account.

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. If you don't have a project, create one.
3. In the search bar at the top, search for and select **"Google Sheets API"**. Click **"Enable"**.
4. In the search bar, search for and select **"IAM & Admin"** > **"Service Accounts"**.
5. Click **"+ CREATE SERVICE ACCOUNT"** at the top.
6. Give it a name (e.g., "psc-guru-sheet-writer") and a description. Click **"CREATE AND CONTINUE"**.
7. For roles, select **"Editor"**. This gives it permission to edit files. Click **"CONTINUE"**.
8. Skip the last step and click **"DONE"**.

### Step 3: Get Service Account Credentials (JSON Key)
1. On the Service Accounts page, find the account you just created and click on the email address.
2. Go to the **"KEYS"** tab.
3. Click **"ADD KEY"** > **"Create new key"**.
4. Select **"JSON"** as the key type and click **"CREATE"**.
5. A `.json` file will be downloaded to your computer. **Treat this file like a password.** Do not share it or commit it to Git.
6. Open this file in a text editor. You will need its contents for the environment variables.

### Step 4: Share Your Google Sheet with the Service Account
1. Go back to your Google Sheet.
2. Click the **"Share"** button in the top right.
3. Open the downloaded `.json` file and find the `client_email` value (it looks like an email address).
4. Paste this email address into the "Add people and groups" field in the Share dialog.
5. Ensure it has **"Editor"** access, then click **"Share"**.

## Part 2: Vercel Environment Variables Setup

Now, you need to add the credentials and IDs to your Vercel project so the app can use them.

1. Go to your project's dashboard on Vercel.
2. Go to **Settings** > **Environment Variables**.
3. Add the following variables. **Ensure you select "Secret" for all of them.**

| Variable Name                | Value                                                                                                                                                             | Description                                                                       |
|------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------|
| `SPREADSHEET_ID`             | The ID you copied from your Google Sheet URL in Step 1.                                                                                                           | Tells the app which sheet to connect to.                                          |
| `GOOGLE_CLIENT_EMAIL`        | The `client_email` value from your downloaded `.json` file.                                                                                                       | The "username" for your service account.                                          |
| `GOOGLE_PRIVATE_KEY`         | The `private_key` value from your downloaded `.json` file. Copy everything inside the quotes, including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` parts. | The "password" for your service account. It will contain `\n` characters; this is correct. |
| `CRON_SECRET`                | **You generate this!** Type a long, random string of text (e.g., `my_very_secret_key_12345`). This acts as a password for your automated tasks.                   | A secret key to ensure only Vercel's cron service can run your scraping function. |
| `VITE_CLERK_PUBLISHABLE_KEY` | Your Clerk key (found in Clerk Dashboard -> API Keys). Starts with `pk_...`                                                                                       | Clerk frontend key for authentication.                                            |
| `CLERK_SECRET_KEY`           | Your Clerk Secret key (found in Clerk Dashboard -> API Keys). Starts with `sk_...`                                                                                | Clerk backend key for verifying Admin users.                                      |
| `API_KEY`                    | Your Gemini API key (from Google AI Studio).                                                                                                                      | Google Gemini key for the AI scraper.                                             |


4. After adding all the variables, you may need to redeploy your project for the changes to take effect.

**You are all set!** Your application is now configured to automatically scrape data daily and serve it instantly to your users.
