import * as github from '@actions/github';
import * as core from '@actions/core';
import * as yaml from 'js-yaml';

const CONFIG_FILE = '.github/pull-request-utility.yaml';

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
    core.info(`Retrieving config from ${CONFIG_FILE}`);
    core.info(`Params used ${JSON.stringify(params)}`);
    const response = await octokit.repos.getContents(params);

    if (typeof response.data.content !== 'string') {
      return
    }
    core.info(response.data.content);
    core.info(Buffer.from(response.data.content, 'base64').toString());
    core.info(yaml.safeLoad(Buffer.from(response.data.content, 'base64').toString()));
    return yaml.safeLoad(Buffer.from(response.data.content, 'base64').toString()) || {}
  } catch (e) {
    if (e.status === 404) {
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