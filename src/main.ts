import * as _ from 'lodash';
import * as core from '@actions/core';
import * as github from '@actions/github';
import { getConfig } from "./config";
import { States } from "./statusStates";
import { isTitleValid } from "./validateTitle";

async function run() {
  const github_token = core.getInput('github-token');
  const gitHubClient = new github.GitHub(github_token);
  const config = await getConfig(gitHubClient);

  const pullRequestSha = github!.context!.payload!.pull_request!.head!.sha
  core.info('SHA of PR: ' + pullRequestSha);

  const titleValidationConfig = _.hasIn(config , 'checks.title-validator');
  core.info('titleValidationConfig: ' + titleValidationConfig);
  if (titleValidationConfig) {
    const pullRequestTitle = github!.context!.payload!.pull_request!.title;
    core.info('pullRequestTitle: ' + pullRequestTitle);
    const titleCheckState = await isTitleValid(pullRequestTitle, _.get(config, 'checks.title-validator.matches'));
    core.info('titleCheckState: ' + titleCheckState);
    gitHubClient.repos.createStatus(
      Object.assign(
        Object.assign({}, github.context.repo),
        {
          sha: pullRequestSha,
          state: titleCheckState ? States.success : States.failure,
          context: 'pull-request-utility/title/validation'
        }
      )
    );
    if (!titleCheckState) {
      gitHubClient.issues.createComment(
        Object.assign(
          Object.assign({}, github.context.repo),
          {
            issue_number: github.context.payload.pull_request.number,
            body: _.get(config, 'checks.title-validator.failure-message')
          }
        )
      );
    }
  }
  /*
  try {
    const context = github.context;
    const
      titleRegexs = core.getInput('title-regexs', {required: true}),
      titleRegexFlags = core.getInput('title-regex-flags') || 'g',
      failureMessage = core.getInput('failure-message', {required: true}),
      title = context!.payload!.pull_request!.title,
      sha = context!.payload!.pull_request!.head!.sha;

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

    const github_token = core.getInput('github-token');
    const pull_request_number = context!.payload!.pull_request!.number;
    const octokit = new github.GitHub(github_token);
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
  */
}

run();
