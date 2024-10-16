// Make the command can only be used by developer
module.exports = ({ interaction, commandObj }) => {
	const { developers } = require("../config");
	if (commandObj.options?.devOnly) {
	  	if (interaction.member.id !== developers) {
			return interaction.reply({
				content: '\`❌\` | This command can only be executed by developer', 
				ephemeral: true
			});
	  	}
	}
};