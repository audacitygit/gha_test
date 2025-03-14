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

let branch = "Unknown Branch";

// Function to read GitHub event payload (async for ES Modules)
async function getMergedBranch() {
    if (process.env.GITHUB_EVENT_NAME === "pull_request") {
        return process.env.GITHUB_HEAD_REF || "Unknown PR Branch"; // ✅ PRs: Get source branch
    }

    if (process.env.GITHUB_EVENT_NAME === "push") {
        let branchName = process.env.GITHUB_REF?.replace(/^refs\/heads\//, "") || "Unknown Branch";

        // Handle merge commits (when branch shows as "merge/3")
        if (process.env.GITHUB_REF.includes("merge")) {
            try {
                const eventPath = process.env.GITHUB_EVENT_PATH;
                if (eventPath) {
                    const eventData = JSON.parse(await fs.readFile(eventPath, "utf8"));
                    branchName = eventData?.pull_request?.head?.ref || "Unknown Merged Branch";
                }
            } catch (error) {
                console.error("❌ Failed to read GitHub event payload:", error.message);
            }
        }
        return branchName;
    }

    return "Unknown Branch";
}

// Run async function to get branch name and send Slack message
(async () => {
    branch = await getMergedBranch();

    let message;
    if (status === "success") {
        message = successMessage(jobName, repo, branch, actor, runUrl);
    } else if (status === "failure") {
        message = failureMessage(jobName, repo, branch, actor, runUrl);
    } else {
        console.error("❌ Invalid status provided. Use 'success' or 'failure'.");
        process.exit(1);
    }

    // Debugging: Log extracted branch name
    console.log(`✅ Extracted Branch Name: ${branch}`);

    // Send message to Slack
    axios
        .post(webhookUrl, message)
        .then(() => console.log("✅ Slack notification sent!"))
        .catch((err) => {
            console.error("❌ Failed to send Slack message:", err.message);
            process.exit(1);
        });
})();
