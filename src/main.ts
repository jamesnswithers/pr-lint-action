import * as core from '@actions/core';
import * as github from '@actions/github';
import { States } from "./statusStates";

async function run() {
  try {
    const context = github.context;
    const
      titleRegexs = core.getInput('title-regexs', {required: true}),
      titleRegexFlags = core.getInput('title-regex-flags') || 'g',
      failureMessage = core.getInput('failure-message', {required: true}),
      title = context!.payload!.pull_request!.title,
      sha = context!.payload!.pull_request!.sha;

    let matchesAny: boolean = false;
    titleRegexs.split(/[\r\n]+/).forEach(function (titleRegex) {
      if (titleRegex === "") {
        return
      }
      core.info(`Checking "${titleRegex}" with "${titleRegexFlags}" flags against the PR title: "${title}"`);

      if (title.match(new RegExp(titleRegex, titleRegexFlags))) {
        matchesAny = true
        core.info(`Match found for PR title "${title}" using regex "${titleRegex}".`);
      }
    });

    const github_token = core.getInput('GITHUB_TOKEN');
    const pull_request_number = context!.payload!.pull_request!.number;
    const octokit = new github.GitHub(github_token);
    core.info(JSON.stringify(context.repo));
    core.info(JSON.stringify(context.payload));
    core.info(JSON.stringify(context.payload.pull_request));
    let titleCheckState = States.success
    if (!matchesAny) {
      titleCheckState = States.failure
      octokit.issues.createComment(Object.assign(Object.assign({}, context.repo), { issue_number: pull_request_number, body: failureMessage }));
    }

    octokit.repos.createStatus(
      Object.assign(
        Object.assign({}, context.repo),
        {
          sha: sha,
          state: titleCheckState,
          context: 'pull-request-utility/title/validation'
        }
      )
    );
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
