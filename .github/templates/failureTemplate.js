export function failureMessage(jobName, repo, branch, actor, runUrl) {
    return {
        text: `🚨 *${jobName}* Failed in *${repo}* on branch *${branch}* 😭\n🔗 <${runUrl}|View Job>\n🛠 Triggered by: *${actor}*`
    };
}
