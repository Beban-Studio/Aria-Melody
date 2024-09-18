// Make the command can only be used by developer
module.exports = ({ interaction, commandObj }) => {
	const { developers } = require("../config")
	if (commandObj.devOnly) {
	  	if (interaction.member.id !== developers) {
			interaction.reply({
				content: '\`❌\` | This command can only be executed by developer', 
				ephemeral: true
			});
		// This must be added to stop the command from being executed.
		return true;
	  }
	}
};