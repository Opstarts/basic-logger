/* global Rollbar:true, rollbar */
/* eslint no-console:0 */
'use strict';

const rollbarToken = Meteor.settings && Meteor.settings.Rollbar &&
  Meteor.settings.Rollbar.post_server_item;

const environment = Meteor.settings && Meteor.settings.public &&
  Meteor.settings.public.environment;

const rollbarConfig = {
  accessToken: rollbarToken,
  captureUncaught: true,
  payload: {
    environment: environment,
  }
};
Rollbar = rollbar.init(rollbarConfig);

Tracker.autorun(function() {
  const userId = Meteor.userId();
  const user = Meteor.users.findOne({ _id: userId, }, { fields: { username: 1 } });
  if (user) {
    rollbarConfig.person = {
      id: user._id,
      username: user.username
    };
    console.log(`User changed, configuring rollbar with ${user._id} and ${user.username}`);
    Rollbar.configure(rollbarConfig);
  }
});
