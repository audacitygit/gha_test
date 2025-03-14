// FAILURE
function failureMessage(jobName, repo, ticketNumber, actor, runUrl, sha, actionType, branch) {
    const jiraBaseUrl = "https://audacitygit.atlassian.net/browse/";
    const jiraUrl = `${jiraBaseUrl}${ticketNumber}`;
    const date = new Date();
    const formattedDate = date.toLocaleString('en-US', {
        timeZone: 'America/New_York',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    }).replace(',', ' at');

    return {
        text: `
        \n
        🚨 *${jobName}* Failed in *${repo}* 😭\n
        🔹 *Ticket:* \`${ticketNumber}\`\n
        🔹 *Commit SHA:* \`${sha}\`\n
        🔹 *Branch:* \`${branch}\`\n
        🔹 *Action Type:* \`${actionType}\`\n
        🛠 Triggered by: *${actor}*\n
        🔗 <${runUrl}|View Job>\n
        📌 View Ticket: <${jiraUrl}|Ticket>\n
        ⏱ Date: ${formattedDate} EST\n
        ______________________________________________
        `
    };
}

module.exports = { failureMessage };


// SUCCESS
function successMessage(jobName, repo, ticketNumber, actor, runUrl, sha, actionType, branch) {
    const jiraBaseUrl = "https://audacitygit.atlassian.net/browse/";
    const jiraUrl = `${jiraBaseUrl}${ticketNumber}`;
    const date = new Date();
    const formattedDate = date.toLocaleString('en-US', {
        timeZone: 'America/New_York',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    }).replace(',', ' at');

    return {
        text: `
        \n
        ✅ *${jobName}* Succeeded in *${repo}* 🎉\n
        🔹 *Ticket:* \`${ticketNumber}\`\n
        🔹 *Commit SHA:* \`${sha}\`\n
        🔹 *Branch:* \`${branch}\`\n
        🔹 *Action Type:* \`${actionType}\`\n
        🛠 Triggered by: *${actor}*\n
        🔗 <${runUrl}|View Job>\n
        📌 View Ticket: <${jiraUrl}|Ticket-${ticketNumber}>\n
        ⏱ Date: ${formattedDate} EST\n
        ______________________________________________
        `
    };
}

module.exports = { successMessage };

// NOTIFY
const fs = require("fs").promises;
const { failureMessage } = require("../templates/failureTemplate");
const { successMessage } = require("../templates/successTemplate");
const process = require("process");

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
        const ticketMatch = prTitle.match(/(PI-\d+)/i);
        return ticketMatch ? ticketMatch[1] : "UNKNOWN-TICKET";
    } catch (error) {
        console.error("❌ Failed to read PR title:", error.message);
        return "UNKNOWN-TICKET";
    }
}

// Send Slack Notification
(async () => {
    const ticketNumber = await getTicketNumber();

    let message;
    if (status === "success") {
        message = successMessage(jobName, repo, ticketNumber, actor, runUrl, sha, actionType, branch);
    } else if (status === "failure") {
        message = failureMessage(jobName, repo, ticketNumber, actor, runUrl, sha, actionType, branch);
    } else {
        console.error("❌ Invalid status provided. Use 'success' or 'failure'.");
        process.exit(1);
    }

    // Debugging: Log extracted values
    console.log(`✅ Extracted Ticket Number: ${ticketNumber}`);
    console.log(`✅ Extracted SHA: ${sha}`);
    console.log(`✅ Extracted Action Type: ${actionType}`);
    console.log(`✅ Extracted Branch: ${branch}`);

    // Send message to Slack using fetch instead of axios
    try {
        const response = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(message),
        });

        if (!response.ok) {
            throw new Error(`Slack webhook failed: ${response.statusText}`);
        }

        console.log("✅ Slack notification sent!");
    } catch (err) {
        console.error("❌ Failed to send Slack message:", err.message);
        process.exit(1);
    }
})();
