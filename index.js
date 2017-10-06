// Simple Twitch Bot (Bl00dBott)
// By: Bl00dLuSt6969
// Date: 09.19.2017
///////////////////////////////////////////////////////////////////////////////////////////
var priv_vars = require ('./private.js');
console.log(priv_vars.twitch_password);

// Admin users
var admin_users = [
  'bl00dlust6969'
];

// Channel response definitions, '|' seperated.  I.E. '!req|message to send to channel'
var text_msgs = [
  '!info|Bl00d is a long time gamer, SysAdmin and tinkerer.',
  '!site|You can visit his website at http://',
  '!test|test recieved'
];

// Whisper response definitions, '|' seperated.  I.E. '!req|message to send to user'
var whisper_msgs = [
  '!testw|test received!!!'
];

// Twitch Client Options
var options = {
  options: {
    debug: true
  },
  connection: {
    cluster: "aws",
    reconnect: true
  },
  identity: {
    username: "Bl00dBott",
    password: priv_vars.twitch_password
  },

  channels: ["#Bl00dLuSt6969"]
};

///////////////////////////////////////////////////////////////////////////////////////////

// Connect to Twitch
var tmi = require("tmi.js");
var client = new tmi.client(options);
client.connect();

// Send message on connect
client.on("connected", function(address, port){
  client.whisper("Bl00dLuSt6969", "I'm here");
});

// Respond to channel commands
client.on("chat", function(channel, userstate, message, self) {
  if (self) return;

  var is_admin = IsAdmin(userstate.username);

  text_msgs.forEach( function (value) { 
    var tmp = value.split("|");
    if(message == tmp[0]) {
      client.say(channel, tmp[1]);
      //console.log(value + " | " + tmp[0] + " | " + tmp[1]); 
    }
  });

  // Code responses
  if ((message == "!viewercount") && (is_admin)) GetViewerCount(function(response) { client.whisper(userstate.username," Viewer Count: " + response); });

});

// Respond to whisper commands
client.on("whisper", function(from, userstate, message, self) {
  if (self) return;

  var is_admin = IsAdmin(userstate.username);

  // Process whipser responses
  whisper_msgs.forEach( function (value) {
    var tmp = value.split("|");
    if(message == tmp[0]) {
      client.whisper(from, tmp[1]);
      //console.log(value + " | " + tmp[0] + " | " + tmp[1]);
    }
  });

  // Code responses
  if ((message == "!viewercount") && (is_admin)) GetViewerCount(function(response) { client.whisper(from, " Viewer Count: " + response); });
  if ((message == "!shutdown") && (is_admin)) { client.whisper(from, "Shutting down....."); process.exit(); }

});

// Function: IsAdmin()
// Desc: Determine if the user is an admin user
function IsAdmin(user) {
  var is_admin = false;

  admin_users.forEach( function (value) {
    if(user == value) {
      is_admin = true; 
    }
    else {
      is_admin = false; 
    }
  });
  return is_admin;
}

// Function: GetViewerCount()
// Desc: Get Viewer Count
// Params: callback - Callback function
function GetViewerCount(callback) { 
  var request = require("request");

  //console.log("GetViewerCount called");

  // Get Chatter Data
  request('http://tmi.twitch.tv/group/user/bl00dlust6969/chatters', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      data = JSON.parse(body);
      //console.log(data.chatters);

      //Get viewer information
      var moderators = data.chatters.moderators;
      var staff = data.chatters.staff;
      var admins = data.chatters.admins;
      var global_mods = data.chatters.global_mods;
      var viewers = data.chatters.viewers;

      // Get viewer counts
      var numMods = moderators.length;
      var numStaff = staff.length;
      var numAdmins = admins.length;
      var numGlobalMods = global_mods.length;
      var numViewers = viewers.length;

      // Total viewers
      var numTotals = numMods + numStaff + numAdmins + numGlobalMods + numViewers;

      // Output
      var count_output = "Viewer Counts: \n\rModerstors: " + numMods + " \n\rStaff: " + numStaff + " \n\rAdmins: " + numAdmins + " \n\rGlobalMods: " + numGlobalMods + " \n\rViewers: " + numViewers + " \n\rTotal: " + numTotals;
      //console.log(count_output);
      //callback(numTotals);
      callback(count_output);
    }
  });
}
