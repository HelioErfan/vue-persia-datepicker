import { createRenderer } from 'vue'

export function createNode(type, text = '') {
  return {
    type, text, children: [], parent: null, props: {}, style: {},
    ownerDocument: { body: { offsetHeight: 0 } },
    classList: { add() {}, remove() {} },
  }
}

// The real Vue transition runs against a host with no CSS animation duration.
// Calendar state and components remain real; only browser animation APIs are supplied.
export function installTransitionEnvironment(t) {
  const previousWindow = globalThis.window
  const previousFrame = globalThis.requestAnimationFrame
  globalThis.window = { getComputedStyle: () => ({ transitionDuration: '0s', animationDuration: '0s' }) }
  globalThis.requestAnimationFrame = (callback) => queueMicrotask(callback)
  t.after(() => {
    if (previousWindow === undefined) delete globalThis.window
    else globalThis.window = previousWindow
    if (previousFrame === undefined) delete globalThis.requestAnimationFrame
    else globalThis.requestAnimationFrame = previousFrame
  })
}

export const renderer = createRenderer({
  createElement: (tag) => createNode(tag),
  createText: (text) => createNode('#text', text),
  createComment: (text) => createNode('#comment', text),
  setText: (node, text) => { node.text = text },
  setElementText: (node, text) => { node.children = []; node.text = text },
  patchProp: (node, key, previous, next) => { node.props[key] = next },
  insert: (node, parent, anchor = null) => {
    if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1)
    const index = anchor ? parent.children.indexOf(anchor) : -1
    parent.children.splice(index < 0 ? parent.children.length : index, 0, node)
    node.parent = parent
  },
  remove: (node) => {
    if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1)
    node.parent = null
  },
  parentNode: (node) => node.parent,
  nextSibling: (node) => node.parent?.children[node.parent.children.indexOf(node) + 1] ?? null,
})

export function descendants(node) {
  return [node, ...node.children.flatMap(descendants)]
}
