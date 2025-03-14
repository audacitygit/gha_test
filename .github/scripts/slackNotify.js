import axios from "axios";
import { failureMessage } from "../templates/failureTemplate.js";
import { successMessage } from "../templates/successTemplate.js";

import process from "node:process";

const webhookUrl = process.argv[2];  // Slack Webhook URL
const status = process.argv[3];      // "success" or "failure"
const jobName = process.argv[4];     // Job name
const repo = process.env.GITHUB_REPOSITORY || "Unknown Repo";
const branch = process.env.GITHUB_REF || "Unknown Branch";
const actor = process.env.GITHUB_ACTOR || "Unknown User";
const runId = process.env.GITHUB_RUN_ID;
const runUrl = `https://github.com/${repo}/actions/runs/${runId}`;

let message;

if (status === "success") {
    message = successMessage(jobName, repo, branch, actor, runUrl);
} else if (status === "failure") {
    message = failureMessage(jobName, repo, branch, actor, runUrl);
} else {
    console.error("❌ Invalid status provided. Use 'success' or 'failure'.");
    process.exit(1);
}

// Send message to Slack
axios
    .post(webhookUrl, message)
    .then(() => console.log("✅ Slack notification sent!"))
    .catch((err) => {
        console.error("❌ Failed to send Slack message:", err.message);
        process.exit(1);
    });
