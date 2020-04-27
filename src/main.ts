import * as core from '@actions/core';
import * as github from '@actions/github';

async function run() {
  try {
    const context = github.context;
    const
      titleRegexs = core.getInput('title-regexs', { required: true }),
      titleRegexFlags = core.getInput('title-regex-flags') || 'g',
      failureMessage = core.getInput('failure-message') || 'Pull Request Title Validation Failed',
      title = context!.payload!.pull_request!.title;

    let matchesAny: boolean = false;
    titleRegexs.split(/\r?\n/).forEach(function (titleRegex) {
      core.info(`Checking "${titleRegex}" with "${titleRegexFlags}" flags against the PR title: "${title}"`);

      if (!title.match(new RegExp(titleRegex, titleRegexFlags))) {
        matchesAny = true
        core.info(`Match found for PR title "${title}" using regex "${titleRegex}".`);
      }
    });

    if (!matchesAny) {
      core.setFailed(failureMessage);

      const github_token = core.getInput('GITHUB_TOKEN');

      const pull_request_number = context!.payload!.pull_request!.number;
      const octokit = new github.GitHub(github_token);
      const new_comment = octokit.issues.createComment(Object.assign(Object.assign({}, context.repo), { issue_number: pull_request_number, body: failureMessage }));
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
