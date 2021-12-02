const { configureStore } = require('@reduxjs/toolkit')
const guilds = require('./reducers/guilds')
const interactionsChannels = require('./reducers/interactionsChannels')

module.exports = configureStore({
  reducer: {
    guilds: guilds.reducer,
    interactionChannels: interactionsChannels.reducer
  }
})
