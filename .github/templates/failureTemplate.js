export function failureMessage(jobName, repo, branch, actor, runUrl) {
    const ticketNumber = branch.match(/^pr-\d+/) || "pr-01"
    const ticketUrl = `https://audacitygit.atlassian.net/browse/${ticketNumber}`
    return {
        text: `🚨 *${jobName}* Failed in *${repo}* on branch *${branch}* 😭\n🔗 <${runUrl}|View Job>\n🛠 Triggered by: *${actor}* \n view ticket: <${ticketUrl}| Ticket> \n \n INFO: `
    };
}
