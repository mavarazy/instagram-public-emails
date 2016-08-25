require('isomorphic-fetch');
const fetchEmailFromText = require('./fetchEmailFromText.js');
const {instaQuery, getUserIdByName} = require('./instagramClient.js');

function processUser(user) {
  if (!user.biography) { return null; }
  const email = fetchEmailFromText(user.biography);
  if (!email) { return null; }
  return Object.assign({}, user, {email});
}

function isPresent(obj) {
   return !!obj;
}

function processMedia({owner}) {
  return processUser(owner);
}


const MAX_PER_QUERY = 1000;
function getFollowers(userId, newDataCB, endCB, stopCB, queryCountPart = `first(${MAX_PER_QUERY})`) {
  instaQuery(`
    ig_user(${userId}) {
      followed_by.${queryCountPart} {
        count,
        page_info {
          end_cursor,
          has_next_page
        },
        nodes {
          id,
          full_name,
          biography,
          username
        }
      }
    }
  `).then(({followed_by}) => {
      if (stopCB()) { return; }
      const usersWithEmails = followed_by.nodes.map(processUser).filter(isPresent);
      newDataCB(usersWithEmails);

      if (followed_by.page_info.has_next_page) {
        getFollowers(userId, newDataCB, endCB, stopCB, `after(${followed_by.page_info.end_cursor}, ${MAX_PER_QUERY})`);
      } else {
        endCB();
      }
    });
}


function getForLocation(locationId, newDataCB, endCB, stopCB, queryCountPart = `first(${MAX_PER_QUERY})`) {
  instaQuery(`
    ig_location(${locationId}) {
      media.${queryCountPart} {
        count,
        page_info {
          end_cursor,
          has_next_page
        },
        nodes {
          owner {
            id,
            full_name,
            biography,
            username
          }
        }
      }
    }
  `).then(({media}) => {
      if (stopCB()) { return; }
      const usersWithEmails = media.nodes.map(processMedia).filter(isPresent);
      newDataCB(usersWithEmails);

      if (media.page_info.has_next_page) {
        getForLocation(locationId, newDataCB, endCB, stopCB, `after(${media.page_info.end_cursor}, ${MAX_PER_QUERY})`);
      } else {
        endCB();
      }
    });
}

function getForTag(tag, newDataCB, endCB, stopCB, queryCountPart = `first(${MAX_PER_QUERY})`) {
  instaQuery(`
    ig_hashtag(${tag}) {
      media.${queryCountPart} {
        count,
        page_info {
          end_cursor,
          has_next_page
        },
        nodes {
          owner {
            id,
            full_name,
            biography,
            username
          }
        }
      }
    }
  `).then(({media}) => {
      if (stopCB()) { return; }
      const usersWithEmails = media.nodes.map(processMedia).filter(isPresent);
      newDataCB(usersWithEmails);

      if (media.page_info.has_next_page) {
        getForTag(tag, newDataCB, endCB, stopCB, `after(${media.page_info.end_cursor}, ${MAX_PER_QUERY})`);
      } else {
        endCB();
      }
    });
}

function getFollowersByUserName(name, doWithUsers, doEnd, stopCB) {
  getUserIdByName(name).then(id => getFollowers(id, doWithUsers, doEnd, stopCB));
}


module.exports = {
  getFollowers, getForLocation, getForTag, getFollowersByUserName
};
