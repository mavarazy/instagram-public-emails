require('isomorphic-fetch');
let promiseRetry = require('promise-retry');

function getUserIdByName(name) {
    return fetch(`https://www.instagram.com/${name}/?__a=1`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            // cookie are used from browser
            'accept-encoding': 'gzip, deflate',
            'x-requested-with': 'XMLHttpRequest',
            'pragma': 'no-cache',
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'accept': 'application/json, text/javascript, */*; q=0.01',
            'cache-control': 'no-cache',
            'authority': 'www.instagram.com',
            'referer': 'https://www.instagram.com/explore/locations/60164/'
        }
    }).then(checkResponseStatus)
        .then(parseJSON)
        .catch(handleFetchError)
        .then(({ user: {id} }) => id);
}

function instaQuery(q) {
    return promiseRetry((retry, number) => {
        console.log('attempt number', number);
        return tryInstaQuery(q).catch(retry);
    }).catch(handleFetchError);
}

function tryInstaQuery(q) {
    return fetch('https://www.instagram.com/query/', {
        method: 'POST',
        credentials: 'include',
        headers: {
            // cookie are used from browser
            'x-csrftoken': window._sharedData.config.csrf_token,

            'accept-encoding': 'gzip, deflate',
            'x-requested-with': 'XMLHttpRequest',
            'pragma': 'no-cache',
            'x-instagram-ajax': 1,
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'accept': 'application/json, text/javascript, */*; q=0.01',
            'cache-control': 'no-cache',
            'authority': 'www.instagram.com',
            'referer': 'https://www.instagram.com/explore/locations/60164/'
        },
        body: 'q=' + encodeURIComponent(q)
    }).then(checkResponseStatus)
        .then(parseJSON)
        .then(checkInstagramJsonStatus);
}

function checkResponseStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response;
    } else {
        var error = new Error(response.statusText);
        error.response = response;
        throw error;
    }
}

function parseJSON(response) {
    return response.json()
}

function checkInstagramJsonStatus(payload) {
    if (payload.status !== 'ok') {
        throw new Error('Response json status isn\'t "OK"');
    }
    return payload;
}


function handleFetchError(error) {
    alert(`Request failed: ${error.message}`);
}



module.exports = {
    getUserIdByName, instaQuery
};
