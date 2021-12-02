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
        return state.filter(interactionChannel => interactionChannel.id !== action.payload.id && interactionChannel.guild !== action.payload.guild)
    },
    updateInteractionsChannels: (state, action) => {
        return state.map(interactionChannel => (interactionChannel.id === action.payload.id  && interactionChannel.guild === action.payload.guild) ? { ...action.payload } : interactionChannel)
    }
  }
})

module.exports = {
    interactionsChannels,
    reducer: interactionsChannels.reducer,
    ...interactionsChannels.actions
}
