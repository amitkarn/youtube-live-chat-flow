import browser from 'webextension-polyfill'
import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersistence from 'vuex-persist'

Vue.use(Vuex)

const vuexPersist = new VuexPersistence({
  storage: browser.storage.local,
  asyncStorage: true,
  restoreState: async (key, storage) => {
    const result = await storage.get(key)
    const json = result[key]

    let state = {}
    try {
      state = JSON.parse(json)
    } catch (e) {} // eslint-disable-line no-empty

    return {
      ...state,
      __storageReady: true
    }
  },
  saveState: async (key, state, storage) => {
    const json = JSON.stringify(state)
    await storage.set({ [key]: json })
  }
})

const initialState = {
  color: '#ffffff',
  avatar: false,
  style: 'simple',
  memberColor: '#66ff66',
  memberAvatar: true,
  memberStyle: 'simple',
  moderatorColor: '#6666ff',
  moderatorAvatar: true,
  moderatorStyle: 'two-line',
  ownerColor: '#ffff66',
  ownerAvatar: true,
  ownerStyle: 'two-line',
  yourColor: '#ff6666',
  yourAvatar: true,
  yourStyle: 'two-line',
  superChatHidden: false,
  superStickerHidden: false,
  membershipHidden: false,
  opacity: '0.8',
  rows: '12',
  speed: '5',
  overflow: 'overlay',
  extendedStyle: ''
}

const config = {
  state: {
    ...initialState,
    filters: [],
    bottomChatFormEnabled: true
  },
  getters: {
    getFilter(state) {
      return ({ id }) => {
        return state.filters.find((filter) => filter.id === id)
      }
    }
  },
  mutations: {
    setColor(state, { color }) {
      state.color = color
    },
    setAvatar(state, { avatar }) {
      state.avatar = avatar
    },
    setStyle(state, { style }) {
      state.style = style
    },
    setMemberColor(state, { memberColor }) {
      state.memberColor = memberColor
    },
    setMemberAvatar(state, { memberAvatar }) {
      state.memberAvatar = memberAvatar
    },
    setMemberStyle(state, { memberStyle }) {
      state.memberStyle = memberStyle
    },
    setModeratorColor(state, { moderatorColor }) {
      state.moderatorColor = moderatorColor
    },
    setModeratorAvatar(state, { moderatorAvatar }) {
      state.moderatorAvatar = moderatorAvatar
    },
    setModeratorStyle(state, { moderatorStyle }) {
      state.moderatorStyle = moderatorStyle
    },
    setOwnerColor(state, { ownerColor }) {
      state.ownerColor = ownerColor
    },
    setOwnerAvatar(state, { ownerAvatar }) {
      state.ownerAvatar = ownerAvatar
    },
    setOwnerStyle(state, { ownerStyle }) {
      state.ownerStyle = ownerStyle
    },
    setYourColor(state, { yourColor }) {
      state.yourColor = yourColor
    },
    setYourAvatar(state, { yourAvatar }) {
      state.yourAvatar = yourAvatar
    },
    setYourStyle(state, { yourStyle }) {
      state.yourStyle = yourStyle
    },
    setSuperChatHidden(state, { superChatHidden }) {
      state.superChatHidden = superChatHidden
    },
    setSuperStickerHidden(state, { superStickerHidden }) {
      state.superStickerHidden = superStickerHidden
    },
    setMembershipHidden(state, { membershipHidden }) {
      state.membershipHidden = membershipHidden
    },
    setOpacity(state, { opacity }) {
      state.opacity = opacity
    },
    setRows(state, { rows }) {
      state.rows = rows
    },
    setSpeed(state, { speed }) {
      state.speed = speed
    },
    setOverflow(state, { overflow }) {
      state.overflow = overflow
    },
    setExtendedStyle(state, { extendedStyle }) {
      state.extendedStyle = extendedStyle
    },
    resetState(state) {
      for (let [k, v] of Object.entries(initialState)) {
        state[k] = v
      }
    },
    addFilter(state, { filter }) {
      const id =
        Math.max.apply(null, [0, ...state.filters.map((item) => item.id)]) + 1

      state.filters = [
        ...state.filters,
        {
          id: id + 1,
          ...filter
        }
      ]
    },
    removeFilter(state, { id }) {
      state.filters = state.filters.filter((item) => item.id !== id)
    },
    setFilter(state, { id, filter }) {
      state.filters = state.filters.map((item) => {
        if (item.id !== id) {
          return item
        }
        return {
          ...item,
          ...filter
        }
      })
    },
    setBottomChatFormEnabled(state, { bottomChatFormEnabled }) {
      state.bottomChatFormEnabled = bottomChatFormEnabled
    }
  },
  plugins: [
    vuexPersist.plugin,
    (store) => {
      store.subscribe(() => {
        browser.runtime.sendMessage({ id: 'settingsChanged' })
      })
    }
  ]
}

export default function createStore(waitStorageReady = false) {
  return new Promise((resolve) => {
    const store = new Vuex.Store(config)
    if (!waitStorageReady) {
      resolve(store)
      return
    }
    // wait for async storage restore
    // @see https://github.com/championswimmer/vuex-persist/issues/15
    const timeout = Date.now() + 1000
    const timer = setInterval(() => {
      if (store.state.__storageReady || Date.now() > timeout) {
        clearInterval(timer)
        resolve(store)
      }
    }, 100)
  })
}
