export function failureMessage(jobName, repo, ticketNumber, actor, runUrl, sha, actionType, branch) {
    const jiraBaseUrl = "https://audacitygit.atlassian.net/browse/";
    const jiraUrl = `${jiraBaseUrl}${ticketNumber}`;
    const date = new Date()
    const formattedDate = date.toLocaleString('en-US', {
        month: 'short',   // "Mar"
        day: 'numeric',   // "14"
        year: 'numeric',  // "2025"
        hour: 'numeric',  // "8"
        minute: '2-digit', // "28"
        hour12: true      // AM/PM format
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
        ⏱ Date: ${formattedDate}\n
        ______________________________________________
        `
    };
}
