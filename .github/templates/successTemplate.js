export function successMessage(jobName, repo, branch, actor, runUrl) {
    return {
        text: `✅ *${jobName}* Succeeded in *${repo}* on branch *${branch}* 🎉\n🔗 <${runUrl}|View Job>\n🛠 Triggered by: *${actor}*`
    };
}
