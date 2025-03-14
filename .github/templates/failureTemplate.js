export function failureMessage(jobName, repo, ticketNumber, actor, runUrl) {
    const jiraBaseUrl = "https://audacitygit.atlassian.net/browse/";
    const ticketId = ticketNumber.match(/^pi-\d+/)?.[0]?.toUpperCase() || "UNKNOWN-TICKET";
    const jiraUrl = `${jiraBaseUrl}${ticketId}`;


    return {
        text: `🚨 *${jobName}* Failed in *${repo}* on branch number *${ticketNumber}* 😭\n🔗 <${runUrl}|View Job>\n🛠 Triggered by: *${actor}* \n view ticket: <${jiraUrl}| Ticket> \n \n INFO: `
    };
}
