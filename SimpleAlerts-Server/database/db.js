const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
var db;
var basePath;

// Use connect method to connect to the server //
MongoClient.connect(process.env.DB_URL, async (err, client) => {
  assert.equal(null, err);
  console.log('Database connection was successful.');

  db = client.db(process.env.DB_NAME);
});

module.exports = {
  findUser: userID => {
    // Use Twitch ID to check for user in DB //
    let usersCollection = db.collection('users');

    return new Promise((resolve, reject) => {
      usersCollection.findOne({
          _id: userID
        },
        (error, user) => {
          if (error) {
            console.log('[findUser] ' + error);
            return reject(error);
          }

          if (user === null) return resolve(null);
          return resolve(user);
        }
      );
    });
  },

  addNewUser: userData => {
    return new Promise((resolve, reject) => {
      console.log('[addNewUser] Starting...');

      let usersCollection = db.collection('users');
      let userObject = {
        _id: userData.id,
        twitchDisplayName: userData.display_name,
        username: userData.name,
        settings: null
      };

      usersCollection.insertOne(userObject, (insertError, data) => {
        if (insertError) {
          console.log('[addNewUser] Insert Error occured.');
          return reject(insertError);
        }

        console.log(`[addNewUser] New user has been inserted.`);
        return resolve(userObject);
      });
    });
  },

  updateSettings: settings => {
    return new Promise((resolve, reject) => {
      console.log('[updateSettings] Starting...');
      let usersCollection = db.collection('users');

      usersCollection.findOneAndUpdate({
          username: settings.username
        }, {
          $set: {
            settings: settings.eventList
          }
        },
        (error, doc) => {
          if (error) {
            console.log(error);
            reject(error);
          } else {
            console.log('Settings updated.');
            resolve(true);
          }
        }
      );
    });
  }
};