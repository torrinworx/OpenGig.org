export default ({ DB }) => ({
	schedule: {
		cron: '*/10 * * * * *',
		tz: 'America/New_York',
		runOnStart: false,
		fn: async () => {
		},
	}
});
