import axios from "axios";
import process from "node:process";
import fs from "fs/promises";

// Slack Webhook URL from GitHub Secrets
const webhookUrl = process.argv[2];

// Read GitHub event payload to get PR details
async function getPRTitle() {
    try {
        const eventPath = process.env.GITHUB_EVENT_PATH;
        if (!eventPath) throw new Error("GITHUB_EVENT_PATH not found");

        const eventData = JSON.parse(await fs.readFile(eventPath, "utf8"));
        return eventData?.pull_request?.title || "Unknown PR Title";
    } catch (error) {
        console.error("❌ Failed to read PR title:", error.message);
        return "Unknown PR Title";
    }
}

// Validate PR title format
async function validatePRTitle() {
    const prTitle = await getPRTitle();
    console.log(`🔍 Checking PR Title: "${prTitle}"`);

    // Ensure "PI-XXXX" appears anywhere in the PR title
    const validPRPattern = /PI-\d+/i;

    if (!validPRPattern.test(prTitle)) {
        console.error(`🚨 PR Title "${prTitle}" does not contain "PI-XXXX".`);

        // Send Slack Notification
        const message = {
            text: `🚨 *Invalid PR Title!* \n\n*PR:* "${prTitle}"\n\nPR titles must include *PI-XXXX* anywhere.\n❌ CI/CD will fail until this is fixed.`
        };

        try {
            await axios.post(webhookUrl, message);
            console.log("✅ Slack notification sent for invalid PR title.");
        } catch (error) {
            console.error("❌ Failed to send Slack message:", error.message);
        }

        process.exit(1); // Fails the job
    } else {
        console.log("✅ PR Title is valid.");
    }
}


// Run the validation
validatePRTitle();
