const { createSlice } = require('@reduxjs/toolkit')
const { Collection } = require("discord.js");

const tempInteractionChannels = createSlice({
  name: 'tempInteractionChannels',
  initialState: [],
  reducers: {
    addTempInteractionChannel: (state, action) => {
        state.push(action.payload)
    },
    removeTempInteractionChannel: (state, action) => {
        return state.filter(tempInteractionChannel => {
            return tempInteractionChannel.voiceInteraction !== action.payload.voiceInteraction
        })
    },
    updateTempInteractionChannel: (state, action) => {
        return state.map(tempInteractionChannel => (tempInteractionChannel.id === action.payload.id  && tempInteractionChannel.guild === action.payload.guild) ? { ...action.payload } : tempInteractionChannel)
    }
  }
})

module.exports = {
    tempInteractionChannels,
    reducer: tempInteractionChannels.reducer,
    ...tempInteractionChannels.actions
}
