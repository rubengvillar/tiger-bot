const { createSlice } = require('@reduxjs/toolkit')

const guilds = createSlice({
  name: 'guilds',
  initialState: [],
  reducers: {
    addGuild: (state, action) => {
      state.push(action.payload)
    },
    removeGuild: (state, action) => {
        return state.filter(guild => guild.id !== action.payload)
    },
    updateGuild: (state, action) => {
        return state.map(guild => (guild.id === action.payload.id ) ? { ...guild, ...action.payload} : guild)
    }
  }
})

module.exports = {
    guilds,
    reducer: guilds.reducer,
    ...guilds.actions
}
