# Setup Guide: Admin User & Backend Authentication

To use the new Admin Panel feature, you need to designate a user as an admin in your Clerk dashboard and add your Clerk Secret Key to your Vercel project.

## Part 1: Set a User as an Admin in Clerk

Clerk allows you to add custom metadata to your users. We will use this to assign an 'admin' role.

1.  Go to your [Clerk Dashboard](https://dashboard.clerk.com/).
2.  Navigate to **Users** from the left sidebar.
3.  Find the user you want to make an admin and click on them. If you don't have a user yet, sign up in your own application first.
4.  On the user's detail page, scroll down to the **Metadata** section.
5.  In the **Public Metadata** card, click **Edit**.
6.  Enter the following JSON object. Be careful to use double quotes as required by JSON syntax.

    ```json
    {
      "role": "admin"
    }
    ```

7.  Click **Save**.

That's it! This user will now be recognized as an administrator by the application and will see the "Admin Panel" link in the header when they are logged in.

## Part 2: Add Clerk Secret Key to Vercel

The backend API needs your Clerk Secret Key to securely verify if a user is an admin.

1.  In your [Clerk Dashboard](https://dashboard.clerk.com/), navigate to **API Keys** from the left sidebar.
2.  Find your **Secret Key**. It will start with `sk_test_` or `sk_live_`.
3.  Click the copy icon to copy the key.
4.  Go to your project's dashboard on Vercel.
5.  Go to **Settings** > **Environment Variables**.
6.  Add a new environment variable:
    -   **Name**: `CLERK_SECRET_KEY`
    -   **Value**: Paste the secret key you copied from Clerk.
    -   **Type**: Make sure it is set as a "Secret" variable.

7.  Click **Save**.

After adding the variable, you may need to redeploy your project for the changes to take effect. Your admin panel is now fully configured and secure.