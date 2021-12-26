const { createSlice } = require('@reduxjs/toolkit')
const { Collection } = require("discord.js");

const interactionsChannels = createSlice({
  name: 'interactionsChannels',
  initialState: [],
  reducers: {
    addInteractionsChannels: (state, action) => {
        state.push(action.payload)
    },
    removeInteractionsChannels: (state, action) => {
        return state.filter(interactionChannel => interactionChannel.interactionId !== action.payload.interactionId && interactionChannel.guildId !== action.payload.guildId && interactionChannel.channelId !== action.payload.channelId)
    },
    updateInteractionsChannels: (state, action) => {
        return state.map(interactionChannel => {
            return (interactionChannel.channelId === action.payload.channelId  && interactionChannel.guildId === action.payload.guildId && interactionChannel.interactionId === action.payload.interactionId) ? { ...action.payload } : interactionChannel
        })
    },
    removeAllInteractionsChannels: (state, action) => {
        return state.filter(interactionChannel => (interactionChannel.channelId === action.payload.channelId && interactionChannel.guildId === action.payload.guildId))
    }

  }
})

module.exports = {
    interactionsChannels,
    reducer: interactionsChannels.reducer,
    ...interactionsChannels.actions
}
