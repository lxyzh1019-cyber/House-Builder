// Scene <-> stored document. The scene is saved as a JSON string because Firestore
// cannot store nested arrays (the room outline is a list of [x, z] pairs) or undefined.
import * as P from '@pascal-app/core'

export function sceneToJson() {
  const { nodes, rootNodeIds } = P.useScene.getState()
  return JSON.stringify({ v: 1, nodes, rootNodeIds })
}

export function jsonToScene(json) {
  const saved = JSON.parse(json)
  P.useScene.getState().setScene(saved.nodes, saved.rootNodeIds)
}
