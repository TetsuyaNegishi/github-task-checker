import axios from 'axios';

const actionObject = axios.create({
  headers: {
    Authorization: `token ${process.env.GITHUB_ACCESS_TOKEN}`,
  },
});

function getDescription(isUnChecked, isBaseBranchMaster) {
  if (!isBaseBranchMaster) {
    return 'Base is not a master branch.';
  }
  if (!isUnChecked) {
    return 'All items are checked.';
  }
  return 'Some items are not checked.';
}

function checkPatternPullRequestCheckbox(pullRequestComment) {
  const checkPattern = /[*+-] \[ \]/;
  return checkPattern.test(pullRequestComment);
}

function getPostData(pullRequestObject, targetUrl) {
  const context = 'Check task';
  const isBaseBranchMaster = pullRequestObject.base.ref === 'master';
  const isUnChecked = checkPatternPullRequestCheckbox(pullRequestObject.body);
  const state = isUnChecked && isBaseBranchMaster ? 'pending' : 'success';
  const description = getDescription(isUnChecked, isBaseBranchMaster);

  const postData = {
    context,
    state,
    description,
    target_url: targetUrl,
  };

  return postData;
}

exports.handler = (event, context) => {
  const requestHeaderEvent = Object(event.headers)['X-GitHub-Event'];
  const requestBody = JSON.parse(event.body);
  const requestBodyAction = requestBody.action;
  const pullRequestObject = requestBody.pull_request;
  const targetUrl = pullRequestObject.statuses_url;

  const isCheckEvent = requestHeaderEvent === 'pull_request' && targetUrl &&
    (requestBodyAction === 'opened' || requestBodyAction === 'edited' ||
     requestBodyAction === 'reopened' || requestBodyAction === 'synchronize');

  if (!isCheckEvent) {
    context.succeed({
      statusCode: 200,
      body: 'Ignore: Do not check Event',
    });
    return;
  }

  const postData = getPostData(pullRequestObject, targetUrl);

  actionObject.post(targetUrl, postData)
    .then((response) => {
      console.log('Success!');
      console.log(postData);
      console.log(response);
      context.succeed({
        statusCode: 200,
        body: 'Success: change pull-request status',
      });
    }).catch((error) => {
      console.error('Error');
      console.error(postData);
      console.error(error);
      context.fail({
        statusCode: 500,
        body: 'Error: faild to chage pull-request status',
      });
    });
};
