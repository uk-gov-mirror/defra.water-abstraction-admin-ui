const uuid = require('uuid/v4');

function sessionGet (request) {
  let session = request.yar.get('session');
  if (session) {
    return session;
  } else {
    console.log('START SESSION');
    session = { id: uuid() };
    sessionSet(request, session);
    return session;
  }
}

function sessionSet (request, session) {
  request.yar.set('session', session);
}

module.exports = {
  get: sessionGet,
  set: sessionSet
};
