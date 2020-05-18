import * as _ from 'lodash';

const FILE_NAME = 'CODEOWNERS';
const FILE_LOCATIONS = ['.github', '/', 'docs'];

/**
 * Retrieves the CODEOWNERS file from the default branch
 *
 * @param {object} gitHubClient An authenticated GitHub context
 * @param {object} params Params to fetch the file with
 * @returns {Promise<object>} The parsed Codeowners file
 * @async
 */
async function retrieveFile(gitHubClient, params) {
  try {
    const response = await gitHubClient.repos.getContents(params);

    if (typeof response.data.content !== 'string') {
      return null;
    }
    return Buffer.from(response.data.content, 'base64').toString();
  } catch (e) {
    if (e.status === 404) {
      return null;
    }

    throw e;
  }
}

/**
 * Finds and retrieves the CODEOWNERS files from the default branch of the repository
 *
 * @param {object} gitHubClient Authenticated GitHub client
 * @returns {String} contents of the CODEOWNERS file
 * @async
 */

async function findAndRetrieveCodeowners(gitHubClient) {
 const codeownersContents = (await retrieveFile(gitHubClient, '.github/') || await retrieveFile(gitHubClient, '/')
                              || await retrieveFile(gitHubClient, 'docs/'))
 if (!codeownersContents) {
   throw new Error('CODEOWNERS not found in the default branch of the repository.');
 }

 return codeownersContents;
}

/**
 * Tests if the Pull Request title is valid, against the configuration provided
 *
 * @param {String} title Title of the Pull Request
 * @param {object} matches List of regexs to test the title
 * @returns {boolean} Whether the title is valid or not
 * @async
 */
export async function validateCodeowners(title, matches) {
  let titleValidated = false;
  _.forEach(matches, function(titleValidation) {
    if (title.match(new RegExp(titleValidation, 'g'))) {
      titleValidated = true;
    }
  });
  return titleValidated;
}