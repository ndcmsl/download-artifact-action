import { getInput, setFailed } from '@actions/core';
import fetch from 'node-fetch';
import { Octokit } from "octokit";
const { writeFile } = require('fs').promises;

const github_token = getInput('github_token');
const owner = getInput('owner');
const repo = getInput('repo');
const name = getInput('name');
const path = getInput('path');
const octokit = new Octokit({
    auth: github_token
  })

async function listArtifacts(): Promise<any> {

    return octokit.request('GET /repos/{owner}/{repo}/actions/artifacts', {
        owner,
        repo
      })
}

async function downloadArtifact(artifact_id:number) {

    let { url } = await octokit.request('GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}/{archive_format}', {
        owner,
        repo,
        artifact_id,
        archive_format: 'zip'
      })

    const response = await fetch(url);
    const buffer = await response.buffer();
    await writeFile(`${path}${name}.zip`, buffer);
}
  
async function main() {

    let artifacts = await listArtifacts();
    artifacts = artifacts.data.artifacts.filter((artifact) => artifact.name == name);

    await downloadArtifact(artifacts[0].id);
}

try {
  main();
} catch (error) {
  setFailed(error.message);
}
