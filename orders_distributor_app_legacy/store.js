const store = {}

function setState(key) {
  const state = store[key]

  if (state?.onChange) {
    store[key] = { ...state, values: null }
    return
  }
  if (!state) {
    store[key] = { values: null, onChange: null }
    return
  }
}

// async function setValue(dep, value) {
//   try {
//     const state = store[dep]

//     state.values = value

//     state.onChange && state.onChange(store)
//   } catch(e) {
//     console.error(e)
//   }
// }

function setValue(dep, value) {
  const state = store[dep]

  state.values = value

  state.onChange && state.onChange(store)
}

function setSubscribe(callback, deps) {
  deps.length > 0 && deps.map(dep => {
    const state = store[dep]
    if (!store[dep]?.onChange) {
      store[dep] = { onChange: null }
    }
    store[dep].onChange = callback
  })
}

module.exports = { store, setState, setValue, setSubscribe }