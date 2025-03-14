export function failureMessage(jobName, repo, branch, actor, runUrl) {
    const ticketUrl = "https://audacitygit.atlassian.net/browse/PI-19"
    return {
        text: `🚨 *${jobName}* Failed in *${repo}* on branch *${branch}* 😭\n🔗 <${runUrl}|View Job>\n🛠 Triggered by: *${actor}* \n view ticket: <${ticketUrl}| Ticket>`
    };
}
