import * as _ from 'lodash';
import * as core from '@actions/core';
import * as github from '@actions/github';
import { getConfig } from "./config";
import { States } from "./statusStates";
import { isTitleValid } from "./validateTitle";
import { validateCodeowners } from "./validateCodeowners";

async function run() {
  const github_token = core.getInput('github-token', { required: true });
  const gitHubClient = new github.GitHub(github_token);
  const config = await getConfig(gitHubClient);
  const pullRequestSha = github!.context!.payload!.pull_request!.head!.sha;

  core.info(JSON.stringify(github));

  if (_.hasIn(config , 'checks.title-validator')) {
    const pullRequestTitle = github!.context!.payload!.pull_request!.title;
    const titleCheckState = await isTitleValid(pullRequestTitle, _.get(config, 'checks.title-validator.matches'));
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
    if (!titleCheckState &&  _.hasIn(config , 'checks.title-validator.failure-message')) {
      gitHubClient.issues.createComment(
        Object.assign(
          Object.assign({}, github.context.repo),
          {
            issue_number: github!.context!.payload!.pull_request!.number,
            body: _.get(config, 'checks.title-validator.failure-message')
          }
        )
      );
    }
  }

  if (_.hasIn(config , 'checks.codeowner.enforce-multiple') && _.get(config, 'checks.codeowner.enforce-multiple')) {
    //validateCodeowners(gitHubClient);
  }
}

run();
