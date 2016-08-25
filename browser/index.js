const { getForLocation, getForTag, getFollowersByUserName } = require('./api.js');
const { saveAs } = require('file-saver');
const { renderTemplate, syncStateWithTemplate } = require('./render.js');


const state = {
  total: 0,
  isRunning: false,
  csv: ''
};


function startApp() {
  function isLogedIn() {
    return !!window._sharedData.config.viewer;
  }

  const loginCheck = setInterval(() => {
      if (isLogedIn()) {
        renderTemplate();
        syncStateWithTemplate(state);
        clearInterval(loginCheck);
      }
    }, 1000
  );
}
startApp();


function doWithUsers(usersWithEmails) {
  state.total += usersWithEmails.length;
  const newText = usersWithEmails.map(({email, full_name, username, followers}) => {
    return `${followers},${username},${email},"${(full_name && full_name.replace('"', '')) || username}"\n`;
  }).join('');
  state.csv += newText;

  syncStateWithTemplate(state);
}


function getFunctionToDoWithUsersAndFilterUniqEmails() {
  const userEmails = [];
  function getUniqueUsers(usersWithEmails) {
    const uniqUsers = usersWithEmails.filter(({email}) => {
      if (userEmails.indexOf(email) === -1) {
        userEmails.push(email);
        return true;
      } else {
        return false;
      }
    });

    return uniqUsers;
  }

  return function doWithUsersAndFilterUniq(usersWithEmails) {
    return doWithUsers(getUniqueUsers(usersWithEmails));
  }
}


function stop() {
  state.isRunning = false;
  syncStateWithTemplate(state);
}
window.stop = stop;


function doEnd() {
  stop();
}

function shouldStopRequest() {
  return !state.isRunning;
}

function start() {
  state.total = 0;
  state.isRunning = true;
  state.csv = 'Followers, User, Email, FullName\n';

  syncStateWithTemplate(state);

  const url = document.location.href;
  const splited = url.split('/');
  const doWithUsersAndFilterUniqEmails = getFunctionToDoWithUsersAndFilterUniqEmails();

  if (splited[4] === 'locations') {
    console.log("Searching by location");
    const locationId = splited[5];
    getForLocation(locationId, doWithUsersAndFilterUniqEmails, doEnd, shouldStopRequest);
  } else if (splited[4] === 'tags') {
    console.log("Searching by tags");
    const tag = splited[5];
    getForTag(tag, doWithUsersAndFilterUniqEmails, doEnd, shouldStopRequest)
  } else if (splited.length === 5) {
    console.log("Searching for followers");
    const name = splited[3];
    getFollowersByUserName(name, doWithUsersAndFilterUniqEmails, doEnd, shouldStopRequest);
  } else {
    stop();
    alert('Unsupported link', url);
  }

}
window.start = start;


function saveTextareaToCSV() {
  const text = state.csv;
  const blob = new Blob([text], {type: "text/plain;charset=utf-8"});
  saveAs(blob, 'emails.csv');
}
window.saveTextareaToCSV = saveTextareaToCSV;
