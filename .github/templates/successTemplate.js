export function successMessage(jobName, repo, ticketNumber, actor, runUrl, sha, actionType, branch) {
    const jiraBaseUrl = "https://audacitygit.atlassian.net/browse/";
    const jiraUrl = `${jiraBaseUrl}${ticketNumber}`;

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
        ______________________________________________
        `
    };
}
