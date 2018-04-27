const fs = require(`fs`);
const Discord = require(`discord.js`);
const ytdl = require('ytdl-core');

let ownerID = `244590122811523082`;
let client = new Discord.Client();
let connections = {};
client.on(`ready`, function () {
	console.log(`ready`);
	client.user.setActivity(`${prefix}help`)
});
let warned = false;
let prefix = `-`;
let commands = [
	{
		name       : `help`,
		args       : [],
		description: `Displays a message with commands and descriptions.`,
		cmd        : function (msg, args) {
			let commandsText = ``;
			for (let i = 0; i < commands.length; i++) {
				let cmd = `${prefix}${commands[i].name}`;
				let spacing = ``;
				while (spacing.length + cmd.length < 20) {
					spacing += ` `;
				}
				commandsText += `${cmd}${spacing}${commands[i].description}`;
			}
			msg.channel.send(`This bot is for the SOLE purpose of playing music.\n**COMMANDS:**\n\`\`\`\n${commandsText}\`\`\``);
		}
	},
	{
		name       : `join`,
		args       : [],
		description: `join the Voice Channel you are currently in.`,
		cmd        : function (msg, args) {
			if (msg.member.voiceChannel) {
				msg.member.voiceChannel.join()
					.then(connect => {
						connections[msg.guild.id] = connect;
						msg.reply(
							`I have successfully connected to the channel!`);
					});
			}
			else {
				msg.reply(`Join a voice channel first`);
			}
		}
	},
	{
		name       : `play`,
		args       : [`YouTube_Link`],
		description: `plays the audio from the YouTube video listed.`,
		cmd        : function (msg, args) {
			if (connections[msg.guild.id]) {
				if (args[0]) {
					let link = msg.content.split(` `)[1];
					if (ytdl.validateURL(link)) {
						msg.channel.send(`<@${msg.author.id}>, Loading Youtube Video`).then(function (m) {
							ytdl.getInfo(ytdl.getVideoID(link), function (err, info) {
								if (err) console.log(err);
								else {
									const stream = ytdl(link);
									const dispatcher = connections[msg.guild.id].playStream(stream);
									m.edit(`<@${msg.author.id}>, playing ${info.title}`);
									dispatcher.on('end', function () {
										connections[msg.guild.id].channel.leave()
										delete connections[msg.guild.id];
									});
								}
							});
						});
					}
					else {
						msg.reply(`Invalid YT link`);
					}
				}
				else {
					const dispatcher = connections[msg.guild.id].playFile('C:/Users/Elijah/Music/SampleAudio.mp3');
					msg.reply(`You didnt supply anything to play.\nPlaying \`SampleAudio.mp3\``);
					dispatcher.on('end', function () {
						connections[msg.guild.id].channel.leave()
						delete connections[msg.guild.id];
					});
				}
			}
			else {
				msg.reply(`I am not in a voice channel.\nJoin a Voice Channel and then use \`${prefix}join\`.`);
			}
		}
	},
	{
		name       : `suggest`,
		args       : [`suggestion`],
		description: `suggestions a command to me.`,
		cmd        : function (msg, args) {
			if (args.length) {
				msg.channel.send(`Your suggestion has been sent.\n*don't abuse this command*`);
				client.users.get(ownerID).send(`${msg.author.username} has suggested:\n- - - - - - - - -\n${args.join(` `)}`);
			}
			else {
				msg.channel.send(`You need to include a suggestion to send to my owner.`)
			}
		}
	}
];
client.on(`message`, function (message) {
	if (!message.guild) {
		message.reply(`I am a Voice Channel bot... commands are SERVER commands only.`);
		return;
	}
	if (message.author.id === client.user.id)return;
	if (message.author.id === ownerID && message.content.toLowerCase() === `${prefix}exit`) {
		if (warned) {
			for (let i = 0; i < connections.length; i++) {
				let members = connections[i].channel.members.array();
				for (let i = 0; i < members.length; i++) {
					client.users.get(members[i].id).send(`I'm sorry for me abruptly stop playing in the Voice Channel you were listening to.\nI had to re-boot. Please continue`);
				}
				connections[i].channel.leave();
			}
			setTimeout(function () {
				process.exit();
			}, 5000);
		}
		else {
			message.author.send(`Are you sure you wish to exit?\nThere are \`${connections.length}\` connections currently.\nRe-run the command in less than \`10\` seconds to actually exit.`);
			warned = true;
			setTimeout(function () {
				warned = false;
			}, 10000);

		}
	}

	let words = message.content.toLowerCase().split(` `);
	for (let i = 0; i < commands.length; i++) {
		if (words[0] === prefix + commands[i].name) {
			words.shift();
			commands[i].cmd(message, words);
			return;
		}
	}
});
client.login(require(`./token.json`).token);