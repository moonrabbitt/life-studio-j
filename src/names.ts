import type { AppState } from "./types"

// Capitalise word initials without damaging names such as McDonald or Jo-Anne.
export function capitaliseName(value: string): string {
  return value.trim().replace(/\s+/g, " ").replace(/(^|[\s'’\-])\p{Ll}/gu, (initial) => initial.toLocaleUpperCase("en-GB"))
}

export function normaliseNames(state: AppState): AppState {
  return {
    ...state,
    name: capitaliseName(state.name),
    people: state.people.map((person) => {
      const name = capitaliseName(person.name)
      return name === person.name ? person : { ...person, name }
    }),
  }
}
