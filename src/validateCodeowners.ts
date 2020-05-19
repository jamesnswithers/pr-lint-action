import * as github from '@actions/github';
 import {Codeowner} from 'codeowners-api';
import { States } from "./statusStates";
import * as _ from 'lodash';

const STATUS_NAME = 'pull-request-utility/codeowners/enforce';

/**
 * Creates a status against the pull request
 *
 * @param {object} gitHubClient Authenticated GitHub client
 * @param {String} status state status
 * @async
 */
async function createStatus(gitHubClient, status) {
  if (github!.context!.payload!.pull_request!.head!.sha) {
    gitHubClient.repos.createStatus(
      Object.assign(
        Object.assign({}, github.context.repo),
        {
          sha: github!.context!.payload!.pull_request!.head!.sha,
          state: status,
          context: STATUS_NAME
        }
      )
    );
  }
}

async function listPullRequestFiles(gitHubClient) {
  const pullRequestFiles = [];
  let keepSearching = true;
  let page = 0;
  do {
    const listedFiles = gitHubClient.pulls.listFiles(
      Object.assign(
        Object.assign({}, github.context.repo),
        {
          per_page: 100,
          page: page
        }
      )
    );
    page++;
  } while (keepSearching)
}

/**
 * Tests required approvers from the CODEOWNERS file have approved the pull request
 *
 * @param {object} gitHubClient Authenticated GitHub client
 * @param {String} githubToken github_token input required for codeowners-api
 * @async
 */
export async function validateCodeowners(gitHubClient, githubToken) {
  const codeOwnersApi = new Codeowner(github.context.repo, {type: 'token', token: githubToken});
  /*
  if (!codeOwnersApi) {
    createStatus(gitHubClient, States.failure);
    return;
  }
  let isCodeownerValidated = false;
  */
}