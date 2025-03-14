import axios from "axios";
import fs from "fs/promises"; // ✅ Use ES Module-compatible file system
import { failureMessage } from "../templates/failureTemplate.js";
import { successMessage } from "../templates/successTemplate.js";
import process from "node:process";

const webhookUrl = process.argv[2];  // Slack Webhook URL
const status = process.argv[3];      // "success" or "failure"
const jobName = process.argv[4];     // Job name
const repo = process.env.GITHUB_REPOSITORY || "Unknown Repo";
const actor = process.env.GITHUB_ACTOR || "Unknown User";
const runId = process.env.GITHUB_RUN_ID;
const runUrl = `https://github.com/${repo}/actions/runs/${runId}`;

// Function to extract PR title from GitHub event payload
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

// Function to extract the ticket number from PR title
async function getTicketNumber() {
    const prTitle = await getPRTitle();
    console.log(`🔍 Checking PR Title: "${prTitle}"`);

    // Regex to extract "PI-XXXX" format
    const ticketMatch = prTitle.match(/(PI-\d+)/);

    if (ticketMatch) {
        return ticketMatch[1]; // Return matched ticket number
    } else {
        console.error(`🚨 PR Title "${prTitle}" does not contain a valid ticket number (PI-XXXX).`);
        return "UNKNOWN-TICKET";
    }
}

// Run async function to get ticket number and send Slack message
(async () => {
    const ticketNumber = await getTicketNumber();

    let message;
    if (status === "success") {
        message = successMessage(jobName, repo, ticketNumber, actor, runUrl);
    } else if (status === "failure") {
        message = failureMessage(jobName, repo, ticketNumber, actor, runUrl);
    } else {
        console.error("❌ Invalid status provided. Use 'success' or 'failure'.");
        process.exit(1);
    }

    // Debugging: Log extracted ticket number
    console.log(`✅ Extracted Ticket Number: ${ticketNumber}`);

    // Send message to Slack
    axios
        .post(webhookUrl, message)
        .then(() => console.log("✅ Slack notification sent!"))
        .catch((err) => {
            console.error("❌ Failed to send Slack message:", err.message);
            process.exit(1);
        });
})();
