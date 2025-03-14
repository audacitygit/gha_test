import axios from "axios";
import fs from "fs/promises";
import { failureMessage } from "../templates/failureTemplate.js";
import { successMessage } from "../templates/successTemplate.js";
import process from "node:process";

const webhookUrl = process.argv[2];  // Slack Webhook URL
const status = process.argv[3];      // "success" or "failure"
const jobName = process.argv[4];     // Job name
const repo = process.env.GITHUB_REPOSITORY || "Unknown Repo";
const actor = process.env.GITHUB_ACTOR || "Unknown User";
const sha = process.env.GITHUB_SHA?.substring(0, 7) || "Unknown SHA"; // Short SHA
const actionType = process.env.GITHUB_EVENT_NAME || "Unknown Action";
const runId = process.env.GITHUB_RUN_ID;
const runUrl = `https://github.com/${repo}/actions/runs/${runId}`;
const branch = process.env.GITHUB_REF?.replace(/^refs\/heads\//, "") || "Unknown Branch";

// Function to extract PR title and get the ticket number
async function getTicketNumber() {
    try {
        const eventPath = process.env.GITHUB_EVENT_PATH;
        if (!eventPath) throw new Error("GITHUB_EVENT_PATH not found");

        const eventData = JSON.parse(await fs.readFile(eventPath, "utf8"));
        const prTitle = eventData?.pull_request?.title || "Unknown PR Title";

        // Extract "PI-XXXX" ticket number
        const ticketMatch = prTitle.match(/(PI-\d+)/);
        return ticketMatch ? ticketMatch[1] : "UNKNOWN-TICKET";
    } catch (error) {
        console.error("❌ Failed to read PR title:", error.message);
        return "UNKNOWN-TICKET";
    }
}

async function getCommitMessage() {
    try {
        const eventPath = process.env.GITHUB_EVENT_PATH;
        if (!eventPath) throw new Error("GITHUB_EVENT_PATH not found");

        const eventData = JSON.parse(await fs.readFile(eventPath, "utf8"));
        console.log("EVENT DATA", eventData)
        const commitMessage = eventData?.head_commit?.message || null;

        // Extract "PI-XXXX" ticket number
        return commitMessage
    } catch (error) {
        console.error("❌ Failed to read PR title:", error.message);
        return "UNKNOWN-TICKET";
    }
}

// Send Slack Notification
(async () => {
    const ticketNumber = await getTicketNumber();
    const commitMessage = await getCommitMessage()

    let message;
    if (status === "success") {
        message = successMessage(jobName, repo, ticketNumber, actor, runUrl, sha, actionType, branch, commitMessage);
    } else if (status === "failure") {
        message = failureMessage(jobName, repo, ticketNumber, actor, runUrl, sha, actionType, branch, commitMessage);
    } else {
        console.error("❌ Invalid status provided. Use 'success' or 'failure'.");
        process.exit(1);
    }

    // Debugging: Log extracted values
    console.log(`✅ Extracted Ticket Number: ${ticketNumber}`);
    console.log(`✅ Extracted SHA: ${sha}`);
    console.log(`✅ Extracted Action Type: ${actionType}`);
    console.log(`✅ Extracted Branch: ${branch}`);

    // Send message to Slack
    axios
        .post(webhookUrl, message)
        .then(() => console.log("✅ Slack notification sent!"))
        .catch((err) => {
            console.error("❌ Failed to send Slack message:", err.message);
            process.exit(1);
        });
})();
