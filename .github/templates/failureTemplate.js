export function failureMessage(jobName, repo, branch, actor, runUrl) {
    const jiraBaseUrl = "https://your-jira-instance.atlassian.net/browse/";
    const ticketId = branch.match(/^pr-\d+/)?.[0]?.toUpperCase() || "UNKNOWN-TICKET";
    const jiraUrl = `${jiraBaseUrl}${ticketId}`;


    return {
        text: `🚨 *${jobName}* Failed in *${repo}* on branch *${branch}* 😭\n🔗 <${runUrl}|View Job>\n🛠 Triggered by: *${actor}* \n view ticket: <${jiraUrl}| Ticket> \n \n INFO: `
    };
}
