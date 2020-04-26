import * as core from '@actions/core';
import * as github from '@actions/github';

async function run() {
  try {
    const context = github.context;
    const
      titleRegex = core.getInput('title-regex', {required: true}),
      titleRegexFlags = core.getInput('title-regex-flags') || 'g',
      title = context!.payload!.pull_request!.title;

    core.info(`Checking "${titleRegex}" with "${titleRegexFlags}" flags against the PR title: "${title}"`);

    if (!title.match(new RegExp(titleRegex, titleRegexFlags))) {
      core.setFailed(`Please fix your PR title to match "${titleRegex}" with "${titleRegexFlags}" flags, and re-trigger the check by pushing a new commit.`);

      const github_token = core.getInput('GITHUB_TOKEN');

      const pull_request_number = context.payload.pull_request.number;
      const octokit = new github.GitHub(github_token);
      const message = "Pull Request title validation Failed";
      const new_comment = octokit.issues.createComment(Object.assign(Object.assign({}, context.repo), { issue_number: pull_request_number, body: message }));
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
