import * as github from '@actions/github';
import * as yaml from 'js-yaml';

const CONFIG_FILE = '.github/pull-request-util.yaml';

/**
 * Decodes and parses a YAML config file
 *
 * @param {string} content Base64 encoded YAML contents
 * @returns {object} The parsed YAML file as native object
 */
function parseConfig(content) {
  return yaml.safeLoad(Buffer.from(content, 'base64').toString()) || {};
}

/**
 * Loads a file from GitHub
 *
 * @param {octokit} context An Octokit context
 * @param {object} params Params to fetch the file with
 * @returns {Promise<object>} The parsed YAML file
 * @async
 */
async function loadYaml(octokit, params) {
  try {
    const response = await octokit.repos.getContents(params);
    return parseConfig(response.data.content);
  } catch (e) {
    if (e.code === 404) {
      return null;
    }

    throw e;
  }
}

/**
 * Loads the specified config file from the context's repository
 *
 * If the config file does not exist in the context's repository, `null`
 * is returned.
 *
 * @param {octokit} context An Octokit context
 * @returns {object} The merged configuration
 * @async
 */
export async function getConfig(octokit) {
  const params = Object.assign(Object.assign({}, github.context.repo), { path: CONFIG_FILE })
  return await loadYaml(octokit, params);
}