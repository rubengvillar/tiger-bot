const { configureStore } = require('@reduxjs/toolkit')
const guilds = require('./reducers/guilds')
const interactionsChannels = require('./reducers/interactionsChannels')
const tempInteractionChannels = require('./reducers/tempInteractionChannels')

module.exports = configureStore({
  reducer: {
    guilds: guilds.reducer,
    interactionChannels: interactionsChannels.reducer,
    tempInteractionChannels: tempInteractionChannels.reducer
  }
})
