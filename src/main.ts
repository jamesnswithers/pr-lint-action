import * as _ from 'lodash';
import * as core from '@actions/core';
import * as github from '@actions/github';
import { getConfig } from "./config";
import { StatusStates } from "./statusStates";
import { isTitleValid } from "./validateTitle";
import { validateCodeowners } from "./validateCodeowners";

const actionsToCheckTitle = ['opened', 'reopened', 'edited', 'synchronized'];

async function run() {
  const github_token = core.getInput('github-token', { required: true });
  const gitHubClient = new github.GitHub(github_token);
  const config = await getConfig(gitHubClient);
  const pullRequestSha = github!.context!.payload!.pull_request!.head!.sha;
  const payload = github!.context!.payload;
  const action = payload!.action || '';

  if (_.hasIn(payload , 'pull_request') || _.hasIn(payload , 'pull_request_review')) {
    core.info('The payload type is not one of pull_request or pull_request_review. Exiting early.');
    return;
  }

  const shouldCheckTitle = actionsToCheckTitle.includes(action);
  const shouldCheckCodeowner = shouldCheckTitle || _.hasIn(payload , 'pull_request_review');

  if (_.hasIn(config , 'checks.title-validator')) {
    const pullRequestTitle = payload!.pull_request!.title;
    const titleCheckState = await isTitleValid(pullRequestTitle, _.get(config, 'checks.title-validator.matches'));
    gitHubClient.repos.createStatus(
      Object.assign(
        Object.assign({}, github.context.repo),
        {
          sha: pullRequestSha,
          state: titleCheckState ? StatusStates.success : StatusStates.failure,
          context: 'pull-request-utility/title/validation'
        }
      )
    );
    if (!titleCheckState &&  _.hasIn(config , 'checks.title-validator.failure-message')) {
      gitHubClient.issues.createComment(
        Object.assign(
          Object.assign({}, github.context.repo),
          {
            issue_number: payload!.pull_request!.number,
            body: _.get(config, 'checks.title-validator.failure-message')
          }
        )
      );
    }
  }

  core.info('shouldCheckTitle: ' + shouldCheckTitle);
  core.info('shouldCheckCodeowner: ' + shouldCheckCodeowner);
  core.info('pull_request_review: ' + payload.pull_request_review);
  const codeownerConfigSet = _.hasIn(config , 'checks.codeowner.enforce-multiple') && _.get(config, 'checks.codeowner.enforce-multiple');
  if (codeownerConfigSet && shouldCheckCodeowner) {
    core.info('inside validate codeowners');
    validateCodeowners(gitHubClient, github_token);
  }
}

run();
