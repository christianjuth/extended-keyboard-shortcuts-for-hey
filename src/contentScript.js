// I didn't want to usee jQuery,
// so I just kinda make my own ¯\_(ツ)_/¯
class jQuery {
  elements = []

  constructor(selector) {
    if(typeof selector === 'string') {
      this.elements = document.querySelectorAll(selector)
    }
    else if (selector instanceof HTMLElement) {
      this.elements.push(selector)
    }
    else if (selector instanceof jQuery) {
      return selector
    } 
    else if(Array.isArray(selector)) {
      this.elements = selector
    }
    return this
  }

  forEach(callback) {
    this.elements.forEach(elm => callback(new jQuery(elm)))
    return this
  }

  click() {
    this.elements.forEach(element => element.click())
    return this
  }

  focus() {
    this.elements.forEach(element => element.focus())
    return this
  }

  find(selector) {
    const newElements = []
    this.elements.forEach(element => {
      // element = element.parentElement ?? element
      newElements.push(...element.querySelectorAll(selector))
    })
    return new jQuery(newElements)
  }

  toArray() {
    return this.elements
  }

  first() {
    return new jQuery(this.elements[0])
  }

  last() {
    return new jQuery(this.elements[this.elements.length-1])
  }

  hasElements() {
    return this.elements.length > 0
  }

  isChecked() {
    return this.elements[0]?.checked
  }

  length() {
    return this.toArray().length
  }

  is(elm) {
    if (elm instanceof HTMLElement) {
      return this.elements[0] === elm
    } else {
      return this.elements[0] === elm.toArray()[0]
    }
  }
}
const $ = (selector) => {
  return new jQuery(selector)
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrollBottom() {
  while ((window.innerHeight + window.scrollY) < document.body.offsetHeight - 100) {
    window.scroll(0, document.body.offsetHeight)
    await sleep(300)
  }
}

function getNextFocusableItem() {
  const postings = $('.posting').toArray()
  const focused = $('.posting--focus-within')

  let found = false

  for (let item of postings) {
    item = $(item)
    if (found) {
      return item
    }

    if (item.is(focused)) {
      found = true
    }
  }
}

function getPreviousFocusableItem() {
  const postings = [...$('.posting').toArray()].reverse()
  const focused = $('.posting--focus-within')

  let found = false

  for (let item of postings) {
    item = $(item)
    if (found) {
      return item
    }

    if (item.is(focused)) {
      found = true
    }
  }
}

function bulkSelectingActive() {
  return $('.bulk-selection--active').hasElements()
}

const actions = {
  SELECT_UP: 'SELECT_UP',
  SELECT_DOWN: 'SELECT_DOWN'
}

const state = {
  lastAction: ''
}

async function addKeyBindings(e) {
  const meta = e.metaKey
  const key = e.key
  // const shift = e.shiftKey

  if (meta && key === 'a') {
    e.preventDefault()
    await scrollBottom()
    const bulkActions = $('.inbox .bulk-actions')
    const inputs = bulkActions.find('input')
    const checkedInputs = bulkActions.find('input:checked')
    const allAreChecked = checkedInputs.length() >= inputs.length()
    
    if (allAreChecked) {
      inputs.forEach(elm => {
        if (elm.isChecked()) {
          elm.click()
        }
      })
    } 
    else {
      inputs.forEach(elm => {
        if (!elm.isChecked()) {
          elm.click()
        }
      })
    }
    return
  }

  if (meta && key === 'ArrowDown') {
    e.preventDefault()
    if (!bulkSelectingActive()) {
      state.lastAction = actions.SELECT_DOWN
    }

    if(!$('.inbox .posting--focus-within').hasElements()) {
      $('.inbox .posting input').first().click()
    } else {
      if (state.lastAction === actions.SELECT_DOWN) {
        $('.inbox .posting--focus-within input:not(:checked)').first().click()
      } else {
        $('.inbox .posting--focus-within input:checked').first().click()
      }
      getNextFocusableItem()?.find('input').click()
    }

    if (!bulkSelectingActive()) {
      state.lastAction = ''
    }
    return
  }

  if (meta && key === 'ArrowUp') {
    e.preventDefault()
    if (!bulkSelectingActive()) {
      state.lastAction = actions.SELECT_UP
    }

    if(!$('.inbox .posting--focus-within').hasElements()) {
      $('.inbox .posting input').last().click()
    } else {
      if (state.lastAction === actions.SELECT_UP) {
        $('.inbox .posting--focus-within input:not(:checked)').first().click()
      } else {
        $('.inbox .posting--focus-within input:checked').first().click()
      }
      getPreviousFocusableItem()?.find('input').click()
    }

    if (!bulkSelectingActive()) {
      state.lastAction = ''
    }
    return
  }

  if (bulkSelectingActive() && (key === 'ArrowDown' || key === 'ArrowUp')) {
    const focused = $(':focus')
    $('.inbox .bulk-actions input:checked').click()
    focused.focus()
    return
  }
}
document.addEventListener('keydown', addKeyBindings)