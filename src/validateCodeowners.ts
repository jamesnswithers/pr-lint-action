import * as _ from 'lodash';
import * as github from '@actions/github';
import * as core from '@actions/core';
import {Codeowner} from 'codeowners-api';
import { States } from "./statusStates";

const STATUS_NAME = 'pull-request-utility/codeowners/enforce';
const PAGE_SIZE = 30;

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
  const numberOfChangedFiles = github!.context!.payload!.pull_request!.changed_files;
  const numberOfPages = _.ceil(numberOfChangedFiles / PAGE_SIZE);
  let page = 0;
  do {
    const listedFiles = await gitHubClient.pulls.listFiles(
      Object.assign(
        Object.assign({}, github.context.repo),
        {
          pull_number: github!.context!.payload!.pull_request!.number,
          per_page: PAGE_SIZE,
          page: page
        }
      )
    );
    //core.info(JSON.stringify(listedFiles));
    core.info(JSON.stringify(listedFiles.data));
    core.info(JSON.stringify(_.map(listedFiles.data, 'filename')));
    pullRequestFiles = _.concat(pullRequestFiles, _.map(listedFiles.data, 'filename'));
    page++;
  } while (page < numberOfPages)
  core.info(JSON.stringify(pullRequestFiles));
  return pullRequestFiles;
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
  const pullRequestFiles = await listPullRequestFiles(gitHubClient);
  /*
  if (!codeOwnersApi) {
    createStatus(gitHubClient, States.failure);
    return;
  }
  let isCodeownerValidated = false;
  */
}