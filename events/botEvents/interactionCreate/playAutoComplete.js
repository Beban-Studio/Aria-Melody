const yt = require("youtube-sr").default;

module.exports = async (interaction) => { 

    if (!interaction.isAutocomplete()) return;

    if (interaction.commandName !== 'play') return;
    const focusedValue = interaction.options.getFocused();

    /* Not using it right now
    async function testUrlRegex(string) {
        return [
            /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/,
            /^(?:spotify:|https:\/\/[a-z]+\.spotify\.com\/(track\/|user\/(.*)\/playlist\/|playlist\/))(.*)$/,
            /^https?:\/\/(?:www\.)?deezer\.com\/[a-z]+\/(track|album|playlist)\/(\d+)$/,
            /^(?:(https?):\/\/)?(?:(?:www|m)\.)?(soundcloud\.com|snd\.sc)\/(.*)$/,
            /(?:https:\/\/music\.apple\.com\/)(?:.+)?(artist|album|music-video|playlist)\/([\w\-\.]+(\/)+[\w\-\.]+|[^&]+)\/([\w\-\.]+(\/)+[\w\-\.]+|[^&]+)/,
        ].some((regex) => {
            return regex.test(string);
        });
    }*/

    if (focusedValue.length <= 2) return [];
    if (/^(http|https):\/\//.test(focusedValue.toLocaleLowerCase())) {
        return interaction.respond([{ name: "URL", value: focusedValue }]);
      }
    const random = "ytsearch"[Math.floor(Math.random() * "ytsearch".length)];
    const results = await yt.search(focusedValue || random, { safeSearch: false, limit: 15 });

    const choices = [];
    for (const video of results) {
        choices.push({ name: video.title, value: video.url });
    }

    const filteredChoices = choices.filter((m) =>
        m.name.toLocaleLowerCase().includes(focusedValue.toLocaleLowerCase())
    );

    const result = filteredChoices.map((choice) =>{
        return {
            name: choice.name,
            value: choice.value
        }
    });
    interaction.respond(result.slice(0, 15)).catch(() => {});
};