const fs = require(`fs`);
const Discord = require(`discord.js`);
const ytdl = require('ytdl-core');

let client = new Discord.Client();
let connections = {};
client.on(`ready`, function () {
	console.log(`ready`);
	client.user.setActivity(`${prefix}help`)
});
let prefix = `-`;
let commands = [
	{
		name: `help`,
		cmd : function (msg, args) {
			msg.channel.send(`This bot is for the SOLE purpose of playing music.\n**COMMANDS:**\n\`\`\`\n${prefix}help                   displays this message\n${prefix}join                   joins the Voice Channel you are in\n${prefix}play [YT_LINK]         plays the audio from the YT_LINK\n${prefix}suggest [Suggestion]   sends a suggestion to my owner.\`\`\``);
		}
	},
	{
		name: `join`,
		cmd : function (msg, args) {
			if (msg.member.voiceChannel) {
				msg.member.voiceChannel.join()
					.then(connect => {
						connections[msg.guild.id] = connect;
						msg.reply(`I have successfully connected to the channel!`);
					});
			}
			else {
				msg.reply(`Join a voice channel first`);
			}
		}
	},
	{
		name: `play`,
		cmd : function (msg, args) {

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
									dispatcher.on('end', () => connections[msg.guild.id].channel.leave())
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
					dispatcher.on('end', () => connections[msg.guild.id].channel.leave());
				}
			}
			else {
				msg.reply(`I am not in a voice channel.\nJoin a Voice Channel and then use \`${prefix}join\`.`);
			}
		}
	},
	{
		name:`suggest`,
		cmd:function (msg,args) {
			if(args.length){
				msg.channel.send(`Your suggestion has been sent.\n*don't abuse this command*`);
				client.users.get(244590122811523082).send(`${msg.author.username} has suggested:\n- - - - - - - - -\n${args.join(` `)}`);
			}
			else{
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